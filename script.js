const fromSel=document.getElementById("fromSystem");
    const toSel=document.getElementById("toSystem");
    const valueIn=document.getElementById("colorValue");
    const resultDiv=document.getElementById("result");
    const previewDiv=document.getElementById("preview");
    const clearBtn=document.getElementById('clear');

    const placeholders = {
      rgb: "Ex: 255,0,0",
      cmyk: "Ex: 0,1,1,0",
      hsl: "Ex: 0,1,0.5",
      hsv: "Ex: 0,1,1"
    };

    fromSel.addEventListener("change",()=>{
      valueIn.placeholder = placeholders[fromSel.value];
      valueIn.value = "";
    });

    function rgbToHex(r,g,b){
      const toHex = n => ('0'+(n>>0).toString(16)).slice(-2);
      return '#'+toHex(r)+toHex(g)+toHex(b);
    }

    function rgbToCmyk(r,g,b){
      let rp=r/255,gp=g/255,bp=b/255;
      let k=1-Math.max(rp,gp,bp);
      if(k===1) return [0,0,0,1];
      let c=(1-rp-k)/(1-k),m=(1-gp-k)/(1-k),y=(1-bp-k)/(1-k);
      return [round(c,4),round(m,4),round(y,4),round(k,4)];
    }

    function cmykToRgb(c,m,y,k){
      let r=255*(1-c)*(1-k);
      let g=255*(1-m)*(1-k);
      let b=255*(1-y)*(1-k);
      return [clamp(Math.round(r),0,255),clamp(Math.round(g),0,255),clamp(Math.round(b),0,255)];
    }

    function rgbToHsl(r,g,b){
      r/=255;g/=255;b/=255;
      let max=Math.max(r,g,b),min=Math.min(r,g,b);
      let h=0,s=0,l=(max+min)/2;
      if(max!==min){
        let d=max-min;
        s=l>0.5?d/(2-max-min):d/(max+min);
        switch(max){
          case r:h=(g-b)/d+(g<b?6:0);break;
          case g:h=(b-r)/d+2;break;
          case b:h=(r-g)/d+4;break;
        }
        h*=60;
      }
      return [round(h,2),round(s,4),round(l,4)];
    }

    function hslToRgb(h,s,l){
      h = ((h%360)+360)%360;
      if(s===0){
        const v = Math.round(l*255);
        return [v,v,v];
      }
      let c=(1-Math.abs(2*l-1))*s;
      let x=c*(1-Math.abs((h/60)%2-1));
      let m=l-c/2;
      let rp=0,gp=0,bp=0;
      if(h<60){rp=c;gp=x;}
      else if(h<120){rp=x;gp=c;}
      else if(h<180){gp=c;bp=x;}
      else if(h<240){gp=x;bp=c;}
      else if(h<300){rp=x;bp=c;}
      else {rp=c;bp=x;}
      return [clamp(Math.round((rp+m)*255),0,255),clamp(Math.round((gp+m)*255),0,255),clamp(Math.round((bp+m)*255),0,255)];
    }

    function rgbToHsv(r,g,b){
      r/=255;g/=255;b/=255;
      let max=Math.max(r,g,b),min=Math.min(r,g,b);
      let h=0,d=max-min;
      let s=max===0?0:d/max;let v=max;
      if(d!==0){
        switch(max){
          case r:h=(g-b)/d+(g<b?6:0);break;
          case g:h=(b-r)/d+2;break;
          case b:h=(r-g)/d+4;break;
        }
        h*=60;
      }
      return [round(h,2),round(s,4),round(v,4)];
    }

    function hsvToRgb(h,s,v){
      h = ((h%360)+360)%360;
      let c=v*s;
      let x=c*(1-Math.abs((h/60)%2-1));
      let m=v-c;
      let rp=0,gp=0,bp=0;
      if(h<60){rp=c;gp=x;}
      else if(h<120){rp=x;gp=c;}
      else if(h<180){gp=c;bp=x;}
      else if(h<240){gp=x;bp=c;}
      else if(h<300){rp=x;bp=c;}
      else {rp=c;bp=x;}
      return [clamp(Math.round((rp+m)*255),0,255),clamp(Math.round((gp+m)*255),0,255),clamp(Math.round((bp+m)*255),0,255)];
    }

    function clamp(v,a,b){return Math.min(Math.max(v,a),b);} 

    function round(n,d=3){return Number(Number(n).toFixed(d));}

    function parseValues(raw){
      if(!raw) return null;
      const vals = raw.split(/[,\s]+/).map(s=>s.trim()).filter(Boolean).map(Number);
      if(vals.some(v=>Number.isNaN(v))) return null;
      return vals;
    }

    document.getElementById("convert").addEventListener("click",()=>{
      const from=fromSel.value,to=toSel.value;
      const vals=parseValues(valueIn.value);
      if(!vals){ resultDiv.textContent = 'Resultado: Valor inválido. Verifique o formato.'; previewDiv.style.display='none'; return; }

      let rgb;
      if(from==="rgb"){
        if(vals.length<3){ resultDiv.textContent='Resultado: RGB precisa de 3 componentes.'; previewDiv.style.display='none'; return; }
        rgb = [clamp(Math.round(vals[0]),0,255), clamp(Math.round(vals[1]||0),0,255), clamp(Math.round(vals[2]||0),0,255)];
      }
      else if(from==="cmyk"){
        if(vals.length<4){ resultDiv.textContent='Resultado: CMYK precisa de 4 componentes.'; previewDiv.style.display='none'; return; }
        rgb = cmykToRgb(...vals.slice(0,4));
      }
      else if(from==="hsl"){
        if(vals.length<3){ resultDiv.textContent='Resultado: HSL precisa de 3 componentes.'; previewDiv.style.display='none'; return; }
        rgb = hslToRgb(vals[0], vals[1], vals[2]);
      }
      else if(from==="hsv"){
        if(vals.length<3){ resultDiv.textContent='Resultado: HSV precisa de 3 componentes.'; previewDiv.style.display='none'; return; }
        rgb = hsvToRgb(vals[0], vals[1], vals[2]);
      }

      let result;
      if(to==="rgb") result=rgb;
      else if(to==="cmyk") result=rgbToCmyk(...rgb);
      else if(to==="hsl") result=rgbToHsl(...rgb);
      else if(to==="hsv") result=rgbToHsv(...rgb);

      resultDiv.textContent = 'Resultado: ' + JSON.stringify(result);

      const hex = rgbToHex(...rgb);
      previewDiv.style.background = hex;
      previewDiv.style.display = 'block';
      previewDiv.setAttribute('aria-hidden','false');
    });

    clearBtn.addEventListener('click', ()=>{
      fromSel.value = 'rgb';
      toSel.value = 'rgb';
      valueIn.value = '';
      valueIn.placeholder = placeholders['rgb'];
      resultDiv.textContent = 'Resultado: ';
      previewDiv.style.display = 'none';
      previewDiv.style.background = 'transparent';
      previewDiv.setAttribute('aria-hidden','true');
    });

    valueIn.placeholder = placeholders['rgb'];