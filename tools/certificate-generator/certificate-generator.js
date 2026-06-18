/* Certificate Generator Studio - all logic, fully client-side */
(function(){
"use strict";

/* State */
let canvas = null;
let tplImage = null;
let baseW = 0, baseH = 0;
let displayScale = 1;
let fields = [];
let excelCols = [];
let excelRows = [];
let mapping = {};
let generated = [];
let previewRowIndex = 0;
let previewOn = false;
let resizeTimer = null;

/* Helpers */
const $ = id => document.getElementById(id);
function isText(o){ return o && (o.type==='i-text' || o.type==='textbox'); }
function toast(msg, isErr){
  const t = $('toast'); $('toastMsg').textContent = msg;
  t.classList.toggle('err', !!isErr); t.classList.add('show');
  clearTimeout(t._t); t._t = setTimeout(()=>t.classList.remove('show'), 2600);
}
function safeName(s){ return String(s==null?'':s).replace(/[\\/:*?"<>|]+/g,'_').replace(/\s+/g,'_').slice(0,80) || 'certificate'; }
function getCanvasFitScale(){
  if(!baseW || !baseH) return 1;
  const wrap = $('canvasWrap');
  const stage = wrap.closest('.stage') || wrap.parentElement;
  const wrapStyles = getComputedStyle(wrap);
  const padX = parseFloat(wrapStyles.paddingLeft) + parseFloat(wrapStyles.paddingRight);
  const availableW = Math.max(260, (stage.clientWidth || window.innerWidth) - padX);
  const top = wrap.getBoundingClientRect().top;
  const availableH = Math.max(280, window.innerHeight - top - 34);
  const fitScale = Math.min(availableW / baseW, availableH / baseH);
  return Math.max(0.05, Math.min(2.5, fitScale));
}
function resizeLiveCanvas(){
  if(!canvas || !baseW || !baseH) return;
  const nextScale = getCanvasFitScale();
  if(!nextScale || Math.abs(nextScale - displayScale) < 0.001) return;
  const ratio = nextScale / displayScale;
  displayScale = nextScale;
  canvas.setWidth(Math.round(baseW * displayScale));
  canvas.setHeight(Math.round(baseH * displayScale));
  canvas.getObjects().forEach(obj=>{
    if(isText(obj)){
      obj.set({
        left: obj.left * ratio,
        top: obj.top * ratio,
        fontSize: obj.fontSize * ratio,
        width: obj.width * ratio
      });
    } else {
      obj.set({
        left: obj.left * ratio,
        top: obj.top * ratio,
        scaleX: obj.scaleX * ratio,
        scaleY: obj.scaleY * ratio
      });
    }
    obj.setCoords();
  });
  canvas.requestRenderAll();
  syncTextWidthInput();
}

/* Template upload */
function setupDrop(dropEl, inputEl, handler){
  dropEl.addEventListener('click', ()=>inputEl.click());
  ['dragenter','dragover'].forEach(e=>dropEl.addEventListener(e, ev=>{ev.preventDefault();dropEl.classList.add('over');}));
  ['dragleave','drop'].forEach(e=>dropEl.addEventListener(e, ev=>{ev.preventDefault();dropEl.classList.remove('over');}));
  dropEl.addEventListener('drop', ev=>{ if(ev.dataTransfer.files.length) handler(ev.dataTransfer.files[0]); });
  inputEl.addEventListener('change', ()=>{ if(inputEl.files.length) handler(inputEl.files[0]); inputEl.value=''; });
}

function loadTemplate(file){
  if(!/image\/(png|jpe?g)/.test(file.type)){ toast('Please upload a PNG or JPG image', true); return; }
  const reader = new FileReader();
  reader.onload = e=>{
    fabric.Image.fromURL(e.target.result, img=>{
      baseW = img.width; baseH = img.height;
      displayScale = getCanvasFitScale();
      initCanvas();
      tplImage = img;
      tplImage.set({selectable:false, evented:false, originX:'left', originY:'top', left:0, top:0});
      tplImage.scaleX = displayScale; tplImage.scaleY = displayScale;
      canvas.add(tplImage); canvas.sendToBack(tplImage);
      fields.forEach(f=>canvas.add(f.obj));
      canvas.requestRenderAll();
      $('emptyCanvas').style.display='none';
      $('canvasFrame').style.display='inline-block';
      $('canvasWrap').classList.add('has-template');
      $('dimPill').textContent = baseW+' x '+baseH+' px';
      $('addFieldBtn').disabled = false;
      toast('Template loaded - add some fields');
    });
  };
  reader.readAsDataURL(file);
}

function initCanvas(){
  if(canvas){ canvas.dispose(); }
  $('cv').width = Math.round(baseW*displayScale);
  $('cv').height = Math.round(baseH*displayScale);
  canvas = new fabric.Canvas('cv', { preserveObjectStacking:true, selection:true });
  canvas.setWidth(Math.round(baseW*displayScale));
  canvas.setHeight(Math.round(baseH*displayScale));
  canvas.on('selection:created', onSelect);
  canvas.on('selection:updated', onSelect);
  canvas.on('selection:cleared', ()=>{ $('propPanel').classList.remove('show'); renderFieldList(); });
  canvas.on('object:modified', ()=>{ updateFieldPill(); syncTextWidthInput(); });
  canvas.on('object:scaling', syncTextWidthInput);
}

/* Fields */
function openModal(){
  $('fieldNameInput').value='';
  const textType = document.querySelector('input[name="fieldType"][value="text"]');
  if(textType) textType.checked = true;
  $('modalBg').classList.add('show');
  setTimeout(()=>$('fieldNameInput').focus(),50);
}
function closeModal(){ $('modalBg').classList.remove('show'); }
function selectedFieldType(){
  const checked = document.querySelector('input[name="fieldType"]:checked');
  return checked ? checked.value : 'text';
}

function buildChips(){
  const chips = ['Name','ID','Class','Section','Rank','Date'];
  const box = $('quickChips'); box.innerHTML='';
  chips.forEach(c=>{
    const s=document.createElement('span'); s.textContent=c;
    s.onclick=()=>{ $('fieldNameInput').value=c; };
    box.appendChild(s);
  });
}

function addField(name, type){
  name = (name||'').trim();
  if(!name){ toast('Please enter a field name', true); return; }
  if(fields.some(f=>f.name.toLowerCase()===name.toLowerCase())){ toast('A field with that name already exists', true); return; }
  if(!canvas){ toast('Upload a template first', true); return; }

  const id = 'f'+Date.now()+Math.floor(Math.random()*1000);
  const cx = canvas.getWidth()/2, cy = canvas.getHeight()/2;
  let obj;

  if(type==='text'){
    const boxBase = Math.min(baseW*0.6, 400);
    obj = new fabric.Textbox('{{'+name+'}}', {
      left:cx, top:cy, originX:'center', originY:'center',
      fontFamily:'Fraunces',
      fontSize: Math.max(12, Math.round(36*displayScale)),
      fill:'#1a1714', textAlign:'center', editable:false,
      width: Math.round(boxBase*displayScale),
      splitByGrapheme:false
    });
    obj._cgMeta = { fontSizeBase:36 };
  } else if(type==='qr'){
    obj = makePlaceholderRect(name, 'QR', '#2b2b2b');
  } else {
    obj = makePlaceholderRect(name, 'Photo', '#3a4a6b');
  }
  obj._cgId = id; obj._cgType = type; obj._cgName = name;
  canvas.add(obj); canvas.setActiveObject(obj); canvas.requestRenderAll();
  fields.push({ id, name, type, obj });
  updateFieldPill();
  renderFieldList();
  refreshMapping();
  toast('Field "'+name+'" added');
  return true;
}

function makePlaceholderRect(name, label, color){
  const w = Math.max(60, Math.round(120*displayScale));
  const rect = new fabric.Rect({ width:w, height:w, fill:'rgba(176,132,49,.10)', stroke:color, strokeDashArray:[5,4], strokeWidth:2, originX:'center', originY:'center', rx:6, ry:6 });
  const txt = new fabric.Text(label, { fontFamily:'JetBrains Mono', fontSize:Math.max(10,Math.round(13*displayScale)), fill:color, originX:'center', originY:'center' });
  const grp = new fabric.Group([rect,txt], { left:canvas.getWidth()/2, top:canvas.getHeight()/2, originX:'center', originY:'center' });
  grp.lockUniScaling = false;
  return grp;
}

function onSelect(){
  const o = canvas.getActiveObject(); if(!o || !o._cgId) { $('propPanel').classList.remove('show'); return; }
  const f = fields.find(f=>f.id===o._cgId); if(!f) return;
  renderFieldList(o._cgId);
  $('propPanel').classList.add('show');
  $('propName').textContent = '{{'+f.name+'}}';
  if(f.type==='text'){
    $('textProps').style.display='block'; $('sizeProps').style.display='none';
    $('pFont').value = o.fontFamily || 'Fraunces';
    $('pSize').value = Math.round((o.fontSize/displayScale));
    $('pColor').value = rgbToHex(o.fill);
    $('pTextW').value = Math.round((o.width*o.scaleX)/displayScale);
    setSeg('pStyle','bold', o.fontWeight==='bold');
    setSeg('pStyle','italic', o.fontStyle==='italic');
    ['left','center','right'].forEach(a=>setSeg('pAlign',a, (o.textAlign||'center')===a, 'data-a'));
  } else {
    $('textProps').style.display='none'; $('sizeProps').style.display='block';
    $('pBoxW').value = Math.round((o.width*o.scaleX)/displayScale);
  }
}

function syncTextWidthInput(){
  const o = canvas && canvas.getActiveObject();
  if(o && isText(o) && $('propPanel').classList.contains('show')){
    $('pTextW').value = Math.round((o.width*o.scaleX)/displayScale);
  }
}

function setSeg(panel,val,on,attr){
  attr = attr || 'data-s';
  $(panel).querySelectorAll('button').forEach(b=>{
    const v = attr==='data-a'? b.dataset.a : b.dataset.s;
    if(v===val) b.classList.toggle('on', !!on);
  });
}

function rgbToHex(c){
  if(!c) return '#000000';
  if(c[0]==='#') return c;
  const m = c.match(/\d+/g); if(!m) return '#000000';
  return '#'+m.slice(0,3).map(x=>(+x).toString(16).padStart(2,'0')).join('');
}

/* Property bindings */
$('pFont').addEventListener('change',()=>{ const o=canvas.getActiveObject(); if(o&&isText(o)){o.set('fontFamily',$('pFont').value);canvas.requestRenderAll();}});
$('pSize').addEventListener('input',()=>{ const o=canvas.getActiveObject(); if(o&&isText(o)){o.set('fontSize',Math.max(6,(+$('pSize').value)*displayScale)); o._cgMeta={fontSizeBase:+$('pSize').value}; canvas.requestRenderAll();}});
$('pColor').addEventListener('input',()=>{ const o=canvas.getActiveObject(); if(o&&isText(o)){o.set('fill',$('pColor').value);canvas.requestRenderAll();}});
$('pTextW').addEventListener('input',()=>{ const o=canvas.getActiveObject(); if(o&&isText(o)){ const target=Math.max(40,(+$('pTextW').value))*displayScale; o.scaleX=1; o.scaleY=1; o.set('width',target); canvas.requestRenderAll(); }});
$('pStyle').addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b)return; const o=canvas.getActiveObject(); if(!(o&&isText(o)))return; const s=b.dataset.s; if(s==='bold'){const on=o.fontWeight!=='bold';o.set('fontWeight',on?'bold':'normal');b.classList.toggle('on',on);} else {const on=o.fontStyle!=='italic';o.set('fontStyle',on?'italic':'normal');b.classList.toggle('on',on);} canvas.requestRenderAll();});
$('pAlign').addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b)return; const o=canvas.getActiveObject(); if(!(o&&isText(o)))return; o.set('textAlign',b.dataset.a); $('pAlign').querySelectorAll('button').forEach(x=>x.classList.remove('on')); b.classList.add('on'); canvas.requestRenderAll();});
$('pBoxW').addEventListener('input',()=>{ const o=canvas.getActiveObject(); if(o&&o.type==='group'){const target=(+$('pBoxW').value)*displayScale; o.scaleX=o.scaleY=target/o.width; canvas.requestRenderAll();}});
$('delField').addEventListener('click',()=>{
  const o=canvas.getActiveObject(); if(!o||!o._cgId)return;
  fields = fields.filter(f=>f.id!==o._cgId);
  canvas.remove(o); canvas.discardActiveObject(); canvas.requestRenderAll();
  $('propPanel').classList.remove('show'); updateFieldPill(); renderFieldList(); refreshMapping();
});

function updateFieldPill(){ $('fieldPill').textContent = fields.length+' field'+(fields.length===1?'':'s'); }
function typeLabel(type){ return type==='qr' ? 'QR Code' : type==='photo' ? 'Photo / Image' : 'Text field'; }
function renderFieldList(activeId){
  const box = $('fieldList');
  if(!box) return;
  const currentId = activeId || (canvas && canvas.getActiveObject() && canvas.getActiveObject()._cgId);
  box.innerHTML = fields.map(f=>`
    <div class="field-row ${f.id===currentId?'active':''}" data-id="${f.id}">
      <div class="field-meta">
        <div class="field-name" title="{{${esc(f.name)}}}">{{${esc(f.name)}}}</div>
        <div class="field-type">${esc(typeLabel(f.type))}</div>
      </div>
      <button class="field-edit" type="button" data-id="${f.id}">Edit</button>
    </div>
  `).join('');
}

function editField(id){
  const f = fields.find(field=>field.id===id);
  if(!f || !canvas) return;
  canvas.setActiveObject(f.obj);
  f.obj.setCoords();
  onSelect();
  canvas.requestRenderAll();
}

$('fieldList').addEventListener('click',e=>{
  const btn = e.target.closest('.field-edit');
  if(btn) editField(btn.dataset.id);
});

/* Keyboard delete */
document.addEventListener('keydown',e=>{
  if((e.key==='Delete'||e.key==='Backspace') && canvas){
    const o=canvas.getActiveObject();
    if(o&&o._cgId && document.activeElement.tagName!=='INPUT' && document.activeElement.tagName!=='SELECT'){
      $('delField').click(); e.preventDefault();
    }
  }
});

window.addEventListener('resize', ()=>{
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(resizeLiveCanvas, 120);
});

/* Excel template export */
function exportExcelTemplate(){
  if(!fields.length){ toast('Add fields first, then export a template', true); return; }
  const headers = fields.map(f=>f.name);
  const sample = {};
  fields.forEach(f=>{
    if(f.type==='qr') sample[f.name]='value to encode in QR';
    else if(f.type==='photo') sample[f.name]='https://example.com/photo.jpg';
    else sample[f.name]='';
  });
  const ws = XLSX.utils.json_to_sheet([sample], {header:headers});
  ws['!cols'] = headers.map(h=>({wch:Math.max(14, h.length+4)}));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Recipients');
  XLSX.writeFile(wb, 'sample-template.xlsx');
  toast('Template exported - '+headers.length+' column'+(headers.length===1?'':'s'));
}

/* Layout export / import */
function exportLayout(){
  if(!fields.length){ toast('No fields to export', true); return; }
  const data = {
    version:1, template:{w:baseW,h:baseH},
    fields: fields.map(f=>{
      const o=f.obj; const c=o.getCenterPoint();
      const base = { field:f.name, type:f.type, x:+(c.x/displayScale).toFixed(2), y:+(c.y/displayScale).toFixed(2), angle:o.angle||0 };
      if(f.type==='text'){
        Object.assign(base,{
          fontSize:o._cgMeta?o._cgMeta.fontSizeBase:Math.round(o.fontSize/displayScale),
          fontFamily:o.fontFamily, fontColor:rgbToHex(o.fill),
          align:o.textAlign, bold:o.fontWeight==='bold', italic:o.fontStyle==='italic',
          boxWidth:+((o.width*o.scaleX)/displayScale).toFixed(2)
        });
      } else {
        base.boxWidth = +((o.width*o.scaleX)/displayScale).toFixed(2);
      }
      return base;
    })
  };
  const blob = new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  saveAs(blob,'certificate-layout.json');
  toast('Layout exported');
}

function importLayout(file){
  const r=new FileReader();
  r.onload=e=>{
    let data; try{ data=JSON.parse(e.target.result);}catch(err){ toast('Invalid JSON file',true); return; }
    if(!data.fields){ toast('No fields found in file',true); return; }
    if(!canvas){ toast('Upload a template before importing a layout',true); return; }
    fields.forEach(f=>canvas.remove(f.obj)); fields=[];
    data.fields.forEach(fd=>{
      const id='f'+Date.now()+Math.floor(Math.random()*100000);
      let obj;
      const x=fd.x*displayScale, y=fd.y*displayScale;
      if(fd.type==='text'||!fd.type){
        obj=new fabric.Textbox('{{'+fd.field+'}}',{
          left:x,top:y,originX:'center',originY:'center',
          fontFamily:fd.fontFamily||'Fraunces',
          fontSize:Math.max(6,(fd.fontSize||36)*displayScale),
          fill:fd.fontColor||'#1a1714', textAlign:fd.align||'center',
          fontWeight:fd.bold?'bold':'normal', fontStyle:fd.italic?'italic':'normal',
          editable:false, angle:fd.angle||0,
          width: Math.round((fd.boxWidth||400)*displayScale),
          splitByGrapheme:false
        });
        obj._cgMeta={fontSizeBase:fd.fontSize||36};
      } else {
        obj=makePlaceholderRect(fd.field, fd.type==='qr'?'QR':'Photo', fd.type==='qr'?'#2b2b2b':'#3a4a6b');
        obj.set({left:x,top:y,angle:fd.angle||0});
        if(fd.boxWidth){ const t=fd.boxWidth*displayScale; obj.scaleX=obj.scaleY=t/obj.width; }
      }
      obj._cgId=id; obj._cgType=fd.type||'text'; obj._cgName=fd.field;
      canvas.add(obj);
      fields.push({id,name:fd.field,type:fd.type||'text',obj});
    });
    canvas.requestRenderAll(); updateFieldPill(); renderFieldList(); refreshMapping();
    toast('Layout imported - '+fields.length+' fields');
  };
  r.readAsText(file);
}

/* Excel */
function loadExcel(file){
  const r=new FileReader();
  r.onload=e=>{
    try{
      const wb=XLSX.read(e.target.result,{type:'array'});
      const ws=wb.Sheets[wb.SheetNames[0]];
      const json=XLSX.utils.sheet_to_json(ws,{defval:''});
      if(!json.length){ toast('Spreadsheet appears empty',true); return; }
      excelRows=json;
      excelCols=Object.keys(json[0]);
      renderTable(); autoMap(); renderMapping();
      $('dataSection').style.display='block';
      $('rowPill').textContent=excelRows.length+' rows';
      $('previewBtn').disabled=false; $('genBtn').disabled=false;
      previewRowIndex=0; markActiveRow();
      toast('Loaded '+excelRows.length+' rows');
    }catch(err){ console.error(err); toast('Could not read spreadsheet',true); }
  };
  r.readAsArrayBuffer(file);
}

function renderTable(){
  const max=Math.min(excelRows.length,200);
  let h='<table><thead><tr><th>#</th>'+excelCols.map(c=>'<th>'+esc(c)+'</th>').join('')+'</tr></thead><tbody>';
  for(let i=0;i<max;i++){
    h+='<tr class="rowsel" data-i="'+i+'"><td style="color:var(--muted);font-family:JetBrains Mono">'+(i+1)+'</td>'+excelCols.map(c=>'<td>'+esc(excelRows[i][c])+'</td>').join('')+'</tr>';
  }
  h+='</tbody></table>';
  $('tableWrap').innerHTML=h;
  $('tableWrap').querySelectorAll('.rowsel').forEach(tr=>{
    tr.onclick=()=>{ previewRowIndex=+tr.dataset.i; markActiveRow(); if(previewOn) renderPreview(); };
  });
}

function markActiveRow(){
  $('tableWrap')&&$('tableWrap').querySelectorAll('.rowsel').forEach(tr=>tr.classList.toggle('active',+tr.dataset.i===previewRowIndex));
}

function esc(s){ return String(s==null?'':s).replace(/[&<>]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[m])); }

function autoMap(){
  mapping={};
  fields.forEach(f=>{
    let col=excelCols.find(c=>c===f.name)
      || excelCols.find(c=>c.toLowerCase()===f.name.toLowerCase())
      || excelCols.find(c=>c.toLowerCase().replace(/\s/g,'')===f.name.toLowerCase().replace(/\s/g,''));
    if(col) mapping[f.name]=col;
  });
}

function renderMapping(){
  const box=$('mapping'); box.innerHTML='';
  if(!fields.length){ box.innerHTML='<div class="hint">Add fields to the certificate to map them.</div>'; return; }
  fields.forEach(f=>{
    const row=document.createElement('div'); row.className='maprow';
    const opts=['<option value="">- none -</option>'].concat(excelCols.map(c=>`<option value="${esc(c)}" ${mapping[f.name]===c?'selected':''}>${esc(c)}</option>`)).join('');
    row.innerHTML=`<span class="col" title="{{${esc(f.name)}}}">{{${esc(f.name)}}}${f.type!=='text'?' ('+f.type+')':''}</span><span class="arrow">&lt;-</span><select data-f="${esc(f.name)}">${opts}</select>`;
    row.querySelector('select').onchange=ev=>{ mapping[f.name]=ev.target.value; };
    box.appendChild(row);
  });
}

function refreshMapping(){ if(excelCols.length){ autoMap(); renderMapping(); } }

/* Rendering */
function qrDataURL(text, sizePx){
  return new Promise(resolve=>{
    const tmp=document.createElement('div'); tmp.style.position='absolute'; tmp.style.left='-9999px';
    document.body.appendChild(tmp);
    new QRCode(tmp,{ text:String(text||' '), width:sizePx, height:sizePx, correctLevel:QRCode.CorrectLevel.M });
    setTimeout(()=>{
      const img=tmp.querySelector('img'), cv=tmp.querySelector('canvas');
      let url = img&&img.src ? img.src : (cv?cv.toDataURL('image/png'):null);
      document.body.removeChild(tmp); resolve(url);
    },60);
  });
}

function normalizeImageUrl(value){
  return String(value||'').trim().replace(/^["']|["']$/g,'');
}

function loadImg(url, opts){
  opts = opts || {};
  url = normalizeImageUrl(url);
  if(!url) return Promise.resolve(null);
  return new Promise(res=>{
    const i=new Image();
    if(opts.crossOrigin !== false) i.crossOrigin='anonymous';
    i.onload=()=>res(i);
    i.onerror=()=>res(null);
    i.src=url;
  });
}

async function loadExportImg(url){
  const cleanUrl = normalizeImageUrl(url);
  const img = await loadImg(cleanUrl, {crossOrigin:true});
  if(img) return img;
  return loadImg(cleanUrl, {crossOrigin:false});
}

async function renderRow(row){
  const off=new fabric.StaticCanvas(null,{width:baseW,height:baseH});
  await new Promise(r=>{ const bg=new fabric.Image(tplImage.getElement(),{left:0,top:0,originX:'left',originY:'top',scaleX:baseW/tplImage.getElement().width,scaleY:baseH/tplImage.getElement().height}); off.add(bg); r(); });

  for(const f of fields){
    const o=f.obj; const c=o.getCenterPoint();
    const X=c.x/displayScale, Y=c.y/displayScale;
    const col=mapping[f.name];
    let val = col!==undefined && col!=='' ? row[col] : '';
    if(val===undefined||val===null) val='';

    if(f.type==='text'){
      const fs=(o._cgMeta?o._cgMeta.fontSizeBase:Math.round(o.fontSize/displayScale));
      const boxW=(o.width*o.scaleX)/displayScale;
      const t=new fabric.Textbox(String(val)||'', {
        left:X, top:Y, originX:'center', originY:'center',
        fontFamily:o.fontFamily, fontSize:fs, fill:o.fill,
        textAlign:o.textAlign, fontWeight:o.fontWeight, fontStyle:o.fontStyle,
        width:boxW, angle:o.angle||0, editable:false
      });
      off.add(t);
    } else if(f.type==='qr'){
      const qrUrl=await qrDataURL(val, 200);
      if(qrUrl){
        const sz=Math.round((o.width*o.scaleX)/displayScale);
        const qr=new fabric.Image(new Image(), {left:X,top:Y,originX:'center',originY:'center',width:sz,height:sz,scaleX:1,scaleY:1,angle:o.angle||0});
        const img=new Image(); img.src=qrUrl;
        qr._element=img;
        off.add(qr);
      }
    } else if(f.type==='photo'){
      try{
        const img=await loadExportImg(val);
        if(img){
          const sz=Math.round((o.width*o.scaleX)/displayScale);
          const fab=new fabric.Image(img,{left:X,top:Y,originX:'center',originY:'center',width:img.width,height:img.height});
          const s=Math.min(sz/img.width, sz/img.height);
          fab.set({scaleX:s,scaleY:s,angle:o.angle||0});
          off.add(fab);
        }
      }catch(e){ console.error(e); }
    }
  }
  return new Promise(r=>off.renderAll(()=>r(off.toDataURL({format:'png',quality:0.95}))));
}

async function renderPreview(){
  if(!canvas || !excelRows.length) return;
  const row=excelRows[previewRowIndex];
  const url=await renderRow(row);
  const img=new Image(); img.src=url;
  img.onload=()=>{
    $('canvasFrame').style.display='block';
    $('canvasFrame').innerHTML='<canvas id="cv"></canvas>';
    const cv=$('cv');
    cv.width=baseW; cv.height=baseH;
    const ctx=cv.getContext('2d');
    ctx.drawImage(img,0,0);
    $('previewPill').textContent='preview row '+(previewRowIndex+1);
  };
}

async function generateAll(){
  if(!fields.length || !excelRows.length){ toast('Add fields and load data first', true); return; }
  generated=[];
  const bar=$('progBar'), txt=$('progTxt'), prog=$('prog');
  prog.classList.add('show');
  for(let i=0;i<excelRows.length;i++){
    const row=excelRows[i];
    const url=await renderRow(row);
    const name=safeName(row[Object.keys(row)[0]]);
    generated.push({name,dataURL:url});
    const pct=Math.round((i+1)/excelRows.length*100);
    bar.style.width=pct+'%';
    txt.textContent=`Generated ${i+1}/${excelRows.length}`;
  }
  prog.classList.remove('show');
  $('zipBtn').disabled=false;
  toast('Generated '+generated.length+' certificates');
}

async function downloadZip(){
  if(!generated.length){ toast('Generate certificates first', true); return; }
  const zip=new JSZip();
  for(const g of generated){
    const data=g.dataURL.split(',')[1];
    zip.file(g.name+'.png', data, {base64:true});
  }
  const blob=await zip.generateAsync({type:'blob'});
  saveAs(blob,'certificates.zip');
  toast('Downloaded '+generated.length+' certificates');
}

/* Event setup */
setupDrop($('tplDrop'), $('tplInput'), loadTemplate);
setupDrop($('xlsxDrop'), $('xlsxInput'), loadExcel);

$('addFieldBtn').addEventListener('click', openModal);
buildChips();
$('modalCancel').addEventListener('click', closeModal);
$('modalAdd').addEventListener('click', ()=>{ if(addField($('fieldNameInput').value, selectedFieldType())) closeModal(); });
$('modalAddAnother').addEventListener('click', ()=>{ addField($('fieldNameInput').value, selectedFieldType()); openModal(); });
document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeModal(); });

$('exportLayout').addEventListener('click', exportExcelTemplate);
$('layoutExportLink').addEventListener('click', e=>{ e.preventDefault(); exportLayout(); });
$('layoutImportLink').addEventListener('click', e=>{ e.preventDefault(); $('importLayout').click(); });
$('importLayout').addEventListener('change', ()=>{ if($('importLayout').files.length) importLayout($('importLayout').files[0]); $('importLayout').value=''; });

$('previewBtn').addEventListener('click', renderPreview);
$('genBtn').addEventListener('click', generateAll);
$('zipBtn').addEventListener('click', downloadZip);

})();
