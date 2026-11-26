"""Saca del motor el plano de un lugar para la IA de imagen: suelo, edificios y mobiliario, sin personas,
sin ambiente y sin textos, con colores de día y el encuadre exacto del juego (escena 1120x780 a 2x).
Uso: python3 plano.py <lugar> [<lugar>...]  →  plano_<lugar>.png"""
import asyncio,sys
import os; sys.path.insert(0,os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),'pruebas'))
from comun import copia_con_gancho, servir, CHROME
from playwright.async_api import async_playwright
async def main(lugares):
    d=copia_con_gancho()
    p=d+'/engine.js';s=open(p).read();s=s.replace('window.T={','window.T={get svg(){return svg},',1);open(p,'w').write(s)
    srv=servir(d,8798)
    async with async_playwright() as pw:
        b=await pw.chromium.launch(executable_path=CHROME,args=['--no-sandbox'])
        for lid in lugares:
            pg=await (await b.new_context(viewport={'width':1120,'height':780},device_scale_factor=2)).new_page()
            await pg.goto('http://localhost:8798/');await pg.wait_for_timeout(900);await pg.click('#avOk')
            await pg.evaluate(f"""(()=>{{const L=T.LUGARES['{lid}'];const svg=T.svg;
              const mob=L.mobiliario().sort((a,b)=>a.z-b.z).map(o=>o.s).join('');
              let h=(L.suelo()+L.edificios()+mob).replace(/<text[\\s\\S]*?<\\/text>/g,'');
              document.body.innerHTML='';document.body.style.margin='0';
              svg.removeAttribute('class');svg.innerHTML=h;svg.setAttribute('viewBox','0 0 1120 780');
              svg.style.cssText='position:fixed;left:0;top:0;width:1120px;height:780px;background:#fff';document.body.appendChild(svg)}})()""")
            await pg.wait_for_timeout(300)
            await pg.screenshot(path=f'plano_{lid}.png',clip={'x':0,'y':0,'width':1120,'height':780})
            print('plano',lid)
        await b.close()
    srv.shutdown()
asyncio.run(main(sys.argv[1:]))
