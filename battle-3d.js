(()=>{
  const THREE_URL='https://cdn.jsdelivr.net/npm/three@0.179.1/build/three.module.js';
  const state={ready:false,renderer:null,scene:null,camera:null,clock:null,raf:0,root:null,left:null,right:null};
  const load=()=>import(THREE_URL).then(THREE=>{state.THREE=THREE;init(THREE)}).catch(()=>{});
  function init(T){const host=document.querySelector('.battle');if(!host||document.querySelector('#battle3d'))return;const wrap=document.createElement('div');wrap.id='battle3d';wrap.style.cssText='width:100%;height:300px;border-radius:24px;overflow:hidden;margin:18px 0;background:#08090d;position:relative';host.insertBefore(wrap,document.querySelector('#shareUrl'));
    const scene=new T.Scene();scene.background=new T.Color(0x08090d);state.scene=scene;state.clock=new T.Clock();
    const camera=new T.PerspectiveCamera(42,wrap.clientWidth/wrap.clientHeight,.1,100);camera.position.set(0,2.2,8);camera.lookAt(0,1,0);state.camera=camera;
    const renderer=new T.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(wrap.clientWidth,wrap.clientHeight);renderer.shadowMap.enabled=true;wrap.appendChild(renderer.domElement);state.renderer=renderer;
    scene.add(new T.HemisphereLight(0xffffff,0x202030,2.2));const key=new T.DirectionalLight(0xffffff,3);key.position.set(2,6,5);key.castShadow=true;scene.add(key);
    const floor=new T.Mesh(new T.CylinderGeometry(4.2,4.2,.25,64),new T.MeshStandardMaterial({color:0x171a22,metalness:.35,roughness:.55}));floor.position.y=-.15;floor.receiveShadow=true;scene.add(floor);
    const grid=new T.GridHelper(8,16,0x4a4f62,0x252936);grid.position.y=0;scene.add(grid);state.root=scene;
    new ResizeObserver(()=>{const w=wrap.clientWidth,h=wrap.clientHeight;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h)}).observe(wrap);state.ready=true;animate();
  }
  function monster(T,m,side){const g=new T.Group();const seed=m?.seed||1;const hue=(seed%360)/360;const mat=new T.MeshStandardMaterial({color:new T.Color().setHSL(hue,.75,.5),roughness:.45,metalness:.15});const dark=new T.MeshStandardMaterial({color:0x17171c,roughness:.8});
    const body=new T.Mesh(new T.SphereGeometry(.92,24,16),mat);body.scale.y=1.12;body.position.y=1.05;body.castShadow=true;g.add(body);const head=new T.Mesh(new T.SphereGeometry(.7,24,16),mat);head.position.y=2.05;head.castShadow=true;g.add(head);
    [-.25,.25].forEach(x=>{const eye=new T.Mesh(new T.SphereGeometry(.09,12,8),new T.MeshBasicMaterial({color:0xffffff}));eye.position.set(x,2.15,.64);g.add(eye)});
    const mouth=new T.Mesh(new T.TorusGeometry(.2,.035,8,20,Math.PI),dark);mouth.rotation.x=Math.PI/2;mouth.position.set(0,1.82,.67);g.add(mouth);
    [-.55,.55].forEach(x=>{const leg=new T.Mesh(new T.CapsuleGeometry(.17,.55,6,12),dark);leg.position.set(x,0.35,0);leg.castShadow=true;g.add(leg)});
    g.position.x=side;g.userData.baseX=side;g.userData.seed=seed;return g;
  }
  window.Battle3D={render:(a,b)=>{if(!state.ready)return;const T=state.THREE;if(state.left)state.scene.remove(state.left);if(state.right)state.scene.remove(state.right);state.left=monster(T,a,-2);state.right=monster(T,b,2);state.scene.add(state.left,state.right)},attack:(side)=>{const m=side==='left'?state.left:state.right;if(!m)return;m.userData.hit=performance.now();const dir=side==='left'?1:-1;m.position.x=m.userData.baseX+dir*.55;setTimeout(()=>{if(m)m.position.x=m.userData.baseX},180)},stop:()=>{}};
  function animate(){state.raf=requestAnimationFrame(animate);const t=state.clock.getElapsedTime();if(state.left){state.left.position.y=Math.sin(t*3)*.035;state.left.rotation.y=Math.sin(t)*.05}if(state.right){state.right.position.y=Math.sin(t*3+1)*.035;state.right.rotation.y=-Math.sin(t)*.05}state.renderer.render(state.scene,state.camera)}
  load();
})();