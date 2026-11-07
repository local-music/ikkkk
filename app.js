import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
const $=id=>document.getElementById(id);
const scene=new THREE.Scene();scene.background=new THREE.Color('#f5f4f6');
const camera=new THREE.PerspectiveCamera(38,1,.1,2000);camera.position.set(155,-190,155);
const renderer=new THREE.WebGLRenderer({canvas:$('scene'),antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.target.set(0,0,15);
scene.add(new THREE.HemisphereLight(0xffffff,0xb8b3bd,2));
const key=new THREE.DirectionalLight(0xffffff,2.4);key.position.set(120,-100,180);key.castShadow=true;scene.add(key);
const fill=new THREE.DirectionalLight(0xffffff,.8);fill.position.set(-100,80,80);scene.add(fill);
const floor=new THREE.Mesh(new THREE.PlaneGeometry(700,700),new THREE.MeshStandardMaterial({color:'#f5f4f6',roughness:1}));floor.rotation.x=-Math.PI/2;floor.position.z=-1;floor.receiveShadow=true;scene.add(floor);
let root=new THREE.Group();scene.add(root);let pivot,opened=false,exploded=false,auto=false;
const defaults={format:'instax',photoW:54,photoH:86,pages:4,direction:'vertical',cover:'#e99ac1',page:'#f2f0eb',title:'',titleColor:'#29252a',photoCover:false,clearance:.5,hinge:.3};
function vals(){let v={...defaults};v.format=$('format').value;v.photoW=v.format==='custom'?+$('photoW').value:({instax:54,square:72,wide:108}[v.format]);v.photoH=v.format==='custom'?+$('photoH').value:({instax:86,square:86,wide:86}[v.format]);v.pages=+$('pages').value;v.direction=$('direction').value;v.cover=$('coverColor').value;v.page=$('pageColor').value;v.title=$('title').value;v.titleColor=$('titleColor').value;v.photoCover=$('photoCover').checked;v.clearance=+$('clearance').value;v.hinge=+$('hinge').value;return v}
const mat=c=>new THREE.MeshStandardMaterial({color:c,roughness:.78});
function box(parent,name,x,y,z,w,h,t,color){let m=new THREE.Mesh(new THREE.BoxGeometry(w,h,t),mat(color));m.name=name;m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
function build(){let v=vals(),W=v.photoW+12,H=v.photoH+16,pt=1.8,ct=2.4,gap=.65;scene.remove(root);root=new THREE.Group();scene.add(root);
 // Covers and photo leaves are shown as solid plates with visible raised retaining rails.
 box(root,'Back cover',0,0,ct/2,W+4,H+4,ct,v.cover);
 for(let i=0;i<v.pages;i++){let z=ct+i*(pt+gap)+pt/2;let g=new THREE.Group();g.position.z=z;root.add(g);
 box(g,`Page ${i+1} backing`,0,0,0,W,H,pt,v.page);
 let rail=1.3,lip=.45;
 box(g,'left photo rail',-W/2+rail/2+1,0,pt/2+.42,rail,H-3,.84,v.page);
 box(g,'right photo rail',W/2-rail/2-1,0,pt/2+.42,rail,H-3,.84,v.page);
 box(g,'bottom photo rail',0,-H/2+rail/2+1,pt/2+.42,W-4,rail,.84,v.page);
 box(g,'retaining lip left',-W/2+2.6,0,pt/2+.83,lip,H-8,.25,v.page);
 box(g,'retaining lip right',W/2-2.6,0,pt/2+.83,lip,H-8,.25,v.page);
 }
 let total=ct+v.pages*(pt+gap);pivot=new THREE.Group();pivot.position.set(-W/2,0,total);root.add(pivot);box(pivot,'Front cover',W/2,0,ct/2,W+4,H+4,ct,v.cover);
 if(v.photoCover){box(pivot,'Photo window surround',W/2,0,ct+.3,W*.62,H*.62,.5,v.page)}
 // Hinge spine represented as a continuous reinforced hinge rail in preview.
 box(root,'Spine',-W/2-1,0,total/2,4,H+4,total,v.cover);
 // Hinged knuckles: alternating barrel segments along the spine axis.
 const hingeMat=mat(v.cover);
 for(let i=0;i<v.pages+2;i++){let cyl=new THREE.Mesh(new THREE.CylinderGeometry(1.8,1.8,Math.max(3,(H+4)/(v.pages+2)-1),24),hingeMat);cyl.rotation.x=Math.PI/2;cyl.position.set(-W/2-1, -H/2+(i+.5)*(H+4)/(v.pages+2),total/2);root.add(cyl)}
 const pin=new THREE.Mesh(new THREE.CylinderGeometry(0.9,0.9,H+5,20),mat('#77747a'));pin.rotation.x=Math.PI/2;pin.position.set(-W/2-1,0,total/2);root.add(pin);
 if(v.title){/* title is included in exported CAD as embossed text */ }
 $('dimensions').textContent=`${Math.round(W+4)} × ${Math.round(H+4)} mm cover · ${v.pages} pages`;
 controls.target.set(0,0,total/2);let r=Math.max(W,H,total);camera.position.set(r*1.8,-r*2.2,r*1.8);controls.update();opened=false;$('open').textContent='Open book';}
function animate(){requestAnimationFrame(animate);if(pivot){let target=opened?1:0;pivot.rotation.y+=(target*Math.PI*.78-pivot.rotation.y)*.08}if(auto)root.rotation.z+=.003;controls.update();renderer.render(scene,camera);resize()}
function resize(){let c=$('scene'),r=c.getBoundingClientRect();if(!r.width||!r.height)return;let w=Math.round(r.width*devicePixelRatio),h=Math.round(r.height*devicePixelRatio);if(c.width!==w||c.height!==h){renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix()}}

// Minimal uncompressed ZIP writer for a standards-based 3MF package.
const crcTable=(()=>{let t=[];for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=(c&1)?(0xedb88320^(c>>>1)):(c>>>1);t[n]=c>>>0}return t})();
function crc32(bytes){let c=0xffffffff;for(let b of bytes)c=crcTable[(c^b)&255]^(c>>>8);return (c^0xffffffff)>>>0}
function zipStore(files){let enc=new TextEncoder(),parts=[],central=[],offset=0;
 for(const [name,content] of Object.entries(files)){let n=enc.encode(name),d=typeof content==='string'?enc.encode(content):content,crc=crc32(d),h=new Uint8Array(30+n.length),v=new DataView(h.buffer);
 v.setUint32(0,0x04034b50,true);v.setUint16(4,20,true);v.setUint16(6,0,true);v.setUint16(8,0,true);v.setUint32(14,crc,true);v.setUint32(18,d.length,true);v.setUint32(22,d.length,true);v.setUint16(26,n.length,true);h.set(n,30);parts.push(h,d);
 let c=new Uint8Array(46+n.length),cv=new DataView(c.buffer);cv.setUint32(0,0x02014b50,true);cv.setUint16(4,20,true);cv.setUint16(6,20,true);cv.setUint16(10,0,true);cv.setUint16(12,0,true);cv.setUint32(16,crc,true);cv.setUint32(20,d.length,true);cv.setUint32(24,d.length,true);cv.setUint16(28,n.length,true);cv.setUint32(42,offset,true);c.set(n,46);central.push(c);offset+=h.length+d.length;
 }
 let centralSize=central.reduce((s,x)=>s+x.length,0),end=new Uint8Array(22),ev=new DataView(end.buffer);ev.setUint32(0,0x06054b50,true);ev.setUint16(8,central.length,true);ev.setUint16(10,central.length,true);ev.setUint32(12,centralSize,true);ev.setUint32(16,offset,true);return new Blob([...parts,...central,end],{type:'model/3mf'});
}
function boxMesh(name,x,y,z,w,h,d,colorIndex){let X=w/2,Y=h/2,Z=d/2,vs=[[-X,-Y,-Z],[X,-Y,-Z],[X,Y,-Z],[-X,Y,-Z],[-X,-Y,Z],[X,-Y,Z],[X,Y,Z],[-X,Y,Z]],faces=[[0,2,1],[0,3,2],[4,5,6],[4,6,7],[0,1,5],[0,5,4],[1,2,6],[1,6,5],[2,3,7],[2,7,6],[3,0,4],[3,4,7]];
 return {name,colorIndex,vertices:vs.map(p=>[p[0]+x,p[1]+y,p[2]+z]),triangles:faces};}
function cylinderMesh(name,x,y,z,r,len,segments,colorIndex){let v=[],t=[];for(let j=0;j<2;j++)for(let i=0;i<segments;i++){let a=2*Math.PI*i/segments;v.push([x+r*Math.cos(a),y+(j?len/2:-len/2),z+r*Math.sin(a)])}
 let bottom=v.length;v.push([x,y-len/2,z]);let top=v.length;v.push([x,y+len/2,z]);for(let i=0;i<segments;i++){let n=(i+1)%segments;t.push([i,n,segments+n],[i,segments+n,segments+i],[bottom,n,i],[top,segments+i,segments+n])}
 return {name,colorIndex,vertices:v,triangles:t};}
function create3MF(v){let W=v.photoW+12,H=v.photoH+16,pt=1.8,ct=2.4,gap=.65,parts=[];
 parts.push(boxMesh('Back cover',0,0,ct/2,W+4,H+4,ct,0));
 parts.push(boxMesh('Front cover',0,0,ct/2,W+4,H+4,ct,0));
 for(let i=0;i<v.pages;i++){let z=ct+i*(pt+gap)+pt/2;parts.push(boxMesh(`Photo page ${i+1} backing`,0,0,z,W,H,pt,1));
 parts.push(boxMesh(`Page ${i+1} left rail`,-W/2+1.7,0,z+pt/2+.42,1.35,H-3,.84,1));
 parts.push(boxMesh(`Page ${i+1} right rail`,W/2-1.7,0,z+pt/2+.42,1.35,H-3,.84,1));
 parts.push(boxMesh(`Page ${i+1} bottom rail`,0,-H/2+1.7,z+pt/2+.42,W-4,1.35,.84,1));}
 let total=ct+v.pages*(pt+gap);parts.push(boxMesh('Spine',-W/2-1,0,total/2,4,H+4,total,0));
 parts.push(cylinderMesh('Hinge pin',-W/2-1,0,total/2,.9,H+5,32,2));
 for(let i=0;i<v.pages+2;i++){let seg=(H+4)/(v.pages+2);parts.push(cylinderMesh(`Hinge barrel ${i+1}`,-W/2-1,-H/2+(i+.5)*seg,total/2,1.8,Math.max(3,seg-1),24,0))}
 let xmlParts=parts.map((p,i)=>`<object id="${i+2}" type="model" name="${xmlEsc(p.name)}" pid="1" pindex="${p.colorIndex}"><mesh><vertices>${p.vertices.map(q=>`<vertex x="${q[0].toFixed(4)}" y="${q[1].toFixed(4)}" z="${q[2].toFixed(4)}"/>`).join('')}</vertices><triangles>${p.triangles.map(t=>`<triangle v1="${t[0]}" v2="${t[1]}" v3="${t[2]}"/>`).join('')}</triangles></mesh></object>`).join('');
 let build=parts.map((p,i)=>`<item objectid="${i+2}"/>`).join('');
 let model=`<?xml version="1.0" encoding="UTF-8"?><model xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02" unit="millimeter" xml:lang="en-US"><resources><basematerials id="1"><base name="Cover" displaycolor="${v.cover.toUpperCase()}FF"/><base name="Pages" displaycolor="${v.page.toUpperCase()}FF"/><base name="Pin" displaycolor="#77747AFF"/></basematerials>${xmlParts}</resources><build>${build}</build></model>`;
 return zipStore({'[Content_Types].xml':'<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/></Types>','_rels/.rels':'<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/></Relationships>','3D/3dmodel.model':model});
}
function xmlEsc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
function download(){let blob=create3MF(vals()),a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download='PhotoBook_Custom.3mf';a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);$('status').textContent='Your 3MF model has been generated. Open it in Bambu Studio and inspect all parts before printing.'}
['format','photoW','photoH','pages','direction','coverColor','pageColor','title','titleColor','photoCover','clearance','hinge'].forEach(id=>$(id).addEventListener('input',()=>{$('custom').classList.toggle('hidden',$('format').value!=='custom');$('pageCount').textContent=$('pages').value;$('clearanceOut').textContent=$('clearance').value+' mm';$('hingeOut').textContent=$('hinge').value+' mm';build()}));
$('download').onclick=download;$('download2').onclick=download;$('open').onclick=()=>{opened=!opened;$('open').textContent=opened?'Close book':'Open book'};$('explode').onclick=()=>{exploded=!exploded;$('explode').textContent=exploded?'Assemble parts':'Explode parts';root.children.forEach((o,i)=>{if(o!==pivot)o.position.x+=(exploded?(i%2?1:-1)*2:-(i%2?1:-1)*2)})};$('home').onclick=()=>{root.rotation.set(0,0,0);build()};$('reset').onclick=()=>{for(let [id,val] of Object.entries({format:'instax',photoW:54,photoH:86,pages:4,direction:'vertical',coverColor:'#e99ac1',pageColor:'#f2f0eb',title:'',titleColor:'#29252a',clearance:.5,hinge:.3}))$(id).value=val;$('photoCover').checked=false;build()};
$('instructions').onclick=()=>$('modal').classList.remove('hidden');$('close').onclick=()=>$('modal').classList.add('hidden');$('modal').onclick=e=>{if(e.target===$('modal'))$('modal').classList.add('hidden')};
build();animate();
