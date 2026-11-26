"""Prueba de actualización: una app instalada con una versión anterior tiene que recibir la actual.

Uso:  python3 pruebas/actualizacion.py <commit_de_la_versión_anterior>
      (por ejemplo: python3 pruebas/actualizacion.py HEAD~1)

Instala la versión anterior, la sustituye por la del repositorio actual y comprueba que aparece
«Hay una versión nueva», que «Actualizar» la aplica y que luego funciona sin conexión.
Recuerda: el navegador solo detecta una versión nueva si cambia sw.js (const VER).
"""
import asyncio, sys, os, shutil
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from comun import copia_con_gancho, version_git, servir, Informe, RAIZ, CHROME
from playwright.async_api import async_playwright

PUERTO = 8791
U = f'http://localhost:{PUERTO}/'
R = Informe()


def vaciar_y_copiar(origen, destino):
    for f in os.listdir(destino):
        p = os.path.join(destino, f)
        shutil.rmtree(p) if os.path.isdir(p) else os.remove(p)
    shutil.copytree(origen, destino, dirs_exist_ok=True, ignore=shutil.ignore_patterns('.git', 'pruebas'))


async def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(2)
    vieja = version_git(sys.argv[1])
    nueva = copia_con_gancho()
    sirve = copia_con_gancho(vieja)
    srv = servir(sirve, PUERTO)
    ver_actual = open(os.path.join(RAIZ, 'sw.js'), encoding='utf8').read().split("const VER = '")[1].split("'")[0]
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=CHROME, args=['--no-sandbox'])
        ctx = await b.new_context(viewport={'width': 390, 'height': 844})
        pg = await ctx.new_page()
        err = []
        pg.on('pageerror', lambda e: err.append(str(e)))
        await pg.goto(U)
        await pg.wait_for_timeout(1500)
        if await pg.is_visible('#avOk'):
            await pg.click('#avOk')
        await pg.reload()
        await pg.wait_for_timeout(1500)
        print('Instalada la versión anterior:', await pg.inner_text('.foot .ver'))
        vaciar_y_copiar(nueva, sirve)
        await pg.reload()
        try:
            await pg.wait_for_selector('#upd.show', timeout=15000)
            R.ok(True, 'aparece «Hay una versión nueva»')
        except Exception:
            R.ok(False, 'aparece «Hay una versión nueva» (¿has cambiado const VER en sw.js?)')
        if await pg.is_visible('#updGo'):
            await pg.click('#updGo')
            await pg.wait_for_timeout(2500)
            if await pg.is_visible('#avOk'):
                await pg.click('#avOk')
            await pg.wait_for_timeout(600)
            pie = await pg.inner_text('.foot .ver')
            R.ok('v' + ver_actual in pie, f'tras «Actualizar» queda en v{ver_actual}: {pie}')
            await ctx.set_offline(True)
            await pg.reload()
            await pg.wait_for_timeout(1500)
            R.ok('v' + ver_actual in await pg.inner_text('.foot .ver'), 'sin conexión sigue en la versión nueva')
        R.ok(not err, f'sin errores JS {err[:2]}')
        await b.close()
    srv.shutdown()
    sys.exit(R.fin())

asyncio.run(main())
