"""Prueba completa de la app. Pasarla SIEMPRE antes de publicar.

Uso:  python3 pruebas/completa.py
Requiere: playwright (pip) y Chrome (ruta en la variable CHROME; por defecto /usr/bin/google-chrome).

Qué comprueba:
  1. App: aviso de primera apertura con licencia, pie del menú, ninguna petición externa,
     modo sin conexión (con la red cortada carga menú y escena).
  2. Sincronización: exportar, importar en otro «dispositivo», no duplicar, rechazar códigos ajenos.
  3. Patrulla: «← Comisaría» con y sin sellos, investigación sin límite.
  4. Resolución completa: en todos los distritos del juego, en escritorio y en móvil, cada viñeta se sella en su
     pase con un clic real, se rellena el expediente con los botones y se cierra el servicio.
     Todas tienen que salir correctas. En móvil, si una persona queda fuera del encuadre de lectura,
     se pulsa ⤢ (lámina entera) y tiene que quedar a la vista.
"""
import asyncio, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from comun import pasar_titulo, copia_con_gancho, servir, Informe, CHROME
from playwright.async_api import async_playwright

PUERTO = 8790
U = f'http://localhost:{PUERTO}/'
VIA = {'adm': 'Vía administrativa · denuncia', 'pen': 'Vía penal · atestado'}
R = Informe()


async def nueva(b, w, h):
    ctx = await b.new_context(viewport={'width': w, 'height': h})
    pg = await ctx.new_page()
    pg.errores = []
    pg.on('pageerror', lambda e: pg.errores.append(str(e)))
    return ctx, pg


async def entrar(pg):
    await pg.goto(U)
    await pg.wait_for_timeout(1200)
    await pasar_titulo(pg)
    if await pg.is_visible('#avOk'):
        await pg.click('#avOk')


async def distrito(pg, did):
    await pg.evaluate(f"document.querySelector('[data-go={did}]').click()")
    await pg.wait_for_timeout(500)


async def centro(pg, vid):
    return await pg.evaluate(f"""(()=>{{const g=document.querySelector('#scene [data-k="{vid}"] .hb');if(!g)return null;
      const b=g.getBoundingClientRect();return [b.x+b.width/2,b.y+b.height/2]}})()""")


async def prueba_app(b):
    print('\n1. App')
    ctx, pg = await nueva(b, 390, 844)
    ext = []
    pg.on('request', lambda r: ext.append(r.url) if not r.url.startswith(U) else None)
    await pg.goto(U)
    await pg.wait_for_timeout(1500)
    tit = await pg.inner_text('#title') if await pg.is_visible('#title') else ''
    R.ok('Iniciar partida' in tit and 'supuestos prácticos' in tit.lower() and 'CC BY-NC 4.0' in tit, 'pantalla de título con «Iniciar partida» y licencia')
    await pasar_titulo(pg)
    txt = await pg.inner_text('#menuBody')
    R.ok(await pg.is_visible('#avOk') and 'CC BY-NC 4.0' in txt, 'aviso de primera apertura con licencia')
    await pg.click('#avOk')
    await pg.reload()
    await pg.wait_for_timeout(1500)
    await pasar_titulo(pg)
    pie = await pg.inner_text('.foot .ver')
    R.ok('CC BY-NC 4.0' in pie and ' v' in pie, f'pie del menú: {pie}')
    R.ok(not ext, f'ninguna petición a servidores externos {ext[:3] if ext else ""}')
    R.ok(await pg.evaluate('!!navigator.serviceWorker.controller'), 'el modo sin conexión controla la página')
    await ctx.set_offline(True)
    await pg.reload()
    await pg.wait_for_timeout(1500)
    await pasar_titulo(pg)
    R.ok(await pg.is_visible('#menuBody'), 'sin conexión: carga el menú')
    await distrito(pg, 'rio')
    R.ok(await pg.evaluate("document.querySelectorAll('#scene [data-k]').length") > 0, 'sin conexión: carga la escena')
    fondos = await pg.evaluate("Promise.all(Object.values(T.LUGARES).filter(l=>l.fondo).map(l=>fetch(l.fondo).then(r=>l.fondo+':'+r.status).catch(()=>l.fondo+':falla')))")
    R.ok(bool(fondos) and all(f.endswith(':200') for f in fondos), f'sin conexión: se sirven los fondos ilustrados {fondos}')
    await ctx.set_offline(False)
    R.ok(not pg.errores, f'sin errores JS {pg.errores[:2]}')
    await ctx.close()


async def prueba_sync(b):
    print('\n2. Sincronización')
    ca, a = await nueva(b, 1300, 850)
    await entrar(a)
    await a.evaluate("localStorage.setItem('inv5.cola',JSON.stringify([{regla:'37.6',tipo:'hallazgo',vid:'37.6-B',t:'Art. 37.6'}]));"
                     "localStorage.setItem('inv5.distrito.hospital',JSON.stringify({res:['35.4-A'],quem:['37.6-B'],sup:false}))")
    await a.reload()
    await a.wait_for_timeout(1000)
    await pasar_titulo(a)
    await a.click('#goSync')
    codigo = await a.input_value('#syOut')
    R.ok(codigo.startswith('INV1.'), 'exporta un código INV1.')
    cb, q = await nueva(b, 1300, 850)
    await entrar(q)
    await q.evaluate("localStorage.setItem('inv5.cola',JSON.stringify([{regla:'36.3',tipo:'senuelo',vid:'S-36.3',t:'Art. 36.3'}]))")
    await q.reload()
    await q.wait_for_timeout(1000)
    await pasar_titulo(q)
    await q.click('#goSync')
    await q.fill('#syIn', codigo)
    await q.click('#syGo')
    cola = await q.evaluate("JSON.parse(localStorage.getItem('inv5.cola')).map(c=>c.vid).sort().join(',')")
    R.ok(cola == '37.6-B,S-36.3', f'importa sumando, sin perder lo propio: {cola}')
    await q.fill('#syIn', codigo)
    await q.click('#syGo')
    R.ok('0 casos' in await q.inner_text('#syMsg'), 'reimportar no duplica')
    await q.fill('#syIn', 'basura')
    await q.click('#syGo')
    R.ok('no es de esta app' in await q.inner_text('#syMsg'), 'rechaza un código ajeno')
    R.ok(not a.errores and not q.errores, 'sin errores JS')
    await ca.close()
    await cb.close()


async def prueba_patrulla(b):
    print('\n3. Patrulla')
    ctx, pg = await nueva(b, 1300, 850)
    await entrar(pg)
    await distrito(pg, 'hospital')
    await pg.click('#back')
    await pg.wait_for_timeout(200)
    R.ok(await pg.is_visible('#menuBody'), '«← Comisaría» sin sellos vuelve directamente')
    await distrito(pg, 'hospital')
    ks = await pg.evaluate("[...new Set([...document.querySelectorAll('#scene [data-k]')].map(e=>e.dataset.k))]")
    hechas = 0
    for k in ks:
        r = await centro(pg, k)
        if not r:
            continue
        await pg.mouse.click(*r)
        await pg.wait_for_timeout(80)
        if await pg.locator('#inv').count() and await pg.is_enabled('#inv'):
            await pg.click('#inv')
            hechas += 1
    R.ok(hechas == len(ks), f'investigación sin límite: {hechas} de {len(ks)}')
    await pg.mouse.click(*(await centro(pg, ks[0])))
    await pg.wait_for_timeout(100)
    if await pg.locator('#sealSin').count():
        await pg.click('#sealSin')
    await pg.click('#back')
    await pg.wait_for_timeout(200)
    R.ok(await pg.is_visible('#abn'), '«← Comisaría» con sellos pide confirmación')
    R.ok(not pg.errores, 'sin errores JS')
    await ctx.close()


async def prueba_resolucion(b, w, h):
    etiqueta = 'escritorio' if w > 700 else 'móvil'
    print(f'\n4. Resolución completa ({etiqueta})')
    ctx, pg = await nueva(b, w, h)
    await entrar(pg)
    distritos = await pg.evaluate('T.DISTRITOS.map(d=>d.id)')
    R.ok(len(distritos) >= 4, f'distritos en el juego: {distritos}')
    for did in distritos:
        await pg.evaluate("localStorage.removeItem('inv5.cola');Object.keys(localStorage).filter(k=>k.startsWith('inv5.distrito')).forEach(k=>localStorage.removeItem(k))")
        await pg.goto(U)
        await pg.wait_for_timeout(800)
        await pasar_titulo(pg)
        await distrito(pg, did)
        items = await pg.evaluate("T.st.mis.items.map(p=>({id:p.v.id,tipo:p.v.tipo,s:p.s,am:T.actM(p),sol:p.v.sol}))")
        problemas = []
        entera = False
        for it in items:
            m = it['am'] if it['am'] is not None else it['s']
            await pg.click(f'#tlab button[data-m="{m}"]')
            await pg.wait_for_timeout(120)
            if await pg.is_visible('#panel #hide'):
                await pg.click('#panel #hide')
                await pg.wait_for_timeout(500)
            r = await centro(pg, it['id'])
            if r and not (0 <= r[0] <= w and 0 <= r[1] <= h) and not entera:
                await pg.click('#zfit')
                await pg.wait_for_timeout(200)
                entera = True
                r = await centro(pg, it['id'])
            if not r or not (0 <= r[0] <= w and 0 <= r[1] <= h):
                problemas.append(f"{it['id']}: fuera de pantalla")
                continue
            await pg.mouse.click(*r)
            await pg.wait_for_timeout(120)
            sel = await pg.evaluate('T.st.sel')
            if sel != it['id']:
                problemas.append(f"{it['id']}: el toque seleccionó {sel}")
                continue
            if it['tipo'] == 'senuelo':
                await pg.click('#sealSin')
            else:
                s = it['sol']
                await pg.click('#seal')
                await pg.click(f'button[data-f="via"][data-v="{VIA[s["via"]]}"]')
                if s['via'] == 'adm':
                    await pg.click(f'button[data-f="grav"][data-v="{s["grav"]}"]')
                    await pg.click(f'button[data-f="act"][data-v="{s["acc"][0]}"]')
                if 'completo' not in await pg.inner_text('#panel .exp .hint'):
                    problemas.append(f"{it['id']}: el expediente no se completa")
        await pg.click('#close')
        await pg.click('#cfmYes')
        await pg.wait_for_timeout(300)
        res = await pg.inner_text('#resBody')
        n = len(await pg.evaluate('Object.keys(T.st.exp)'))
        R.ok(not problemas and n == len(items) and 'Errores de este servicio' not in res,
             f'{did}: {n} de {len(items)} viñetas selladas y resueltas, todas correctas' + (f' · {problemas}' if problemas else ''))
    R.ok(not pg.errores, f'sin errores JS {pg.errores[:2]}')
    await ctx.close()


async def main():
    carpeta = copia_con_gancho()
    srv = servir(carpeta, PUERTO)
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=CHROME, args=['--no-sandbox'])
        await prueba_app(b)
        await prueba_sync(b)
        await prueba_patrulla(b)
        await prueba_resolucion(b, 1300, 850)
        await prueba_resolucion(b, 390, 844)
        await b.close()
    srv.shutdown()
    sys.exit(R.fin())

asyncio.run(main())
