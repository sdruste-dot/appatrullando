"""Utilidades compartidas por las pruebas: copia de la app con gancho de pruebas y servidor local."""
import os, shutil, subprocess, tempfile, threading, functools, http.server, socketserver

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROME = os.environ.get('CHROME', '/usr/bin/google-chrome')
RUIDO = ('agent-proxy', 'android.clients', 'accounts.google')


def copia_con_gancho(origen=RAIZ, destino=None):
    """Copia la app a una carpeta temporal y expone window.T al final de engine.js.
    El gancho solo existe en la copia de pruebas, nunca en el repositorio."""
    destino = destino or tempfile.mkdtemp(prefix='appatrullando-prueba-')
    shutil.copytree(origen, destino, dirs_exist_ok=True,
                    ignore=shutil.ignore_patterns('.git', 'pruebas', '__pycache__'))
    p = os.path.join(destino, 'engine.js')
    s = open(p, encoding='utf8').read()
    i = s.rstrip().rfind('}')
    s = s[:i] + 'window.T={get st(){return st},plOf,actM,DISTRITOS,LUGARES};\n}\n'
    open(p, 'w', encoding='utf8').write(s)
    return destino


def version_git(commit, destino=None):
    """Extrae una versión anterior del repositorio (para probar actualizaciones)."""
    destino = destino or tempfile.mkdtemp(prefix='appatrullando-vieja-')
    arch = subprocess.run(['git', '-C', RAIZ, 'archive', commit], capture_output=True, check=True).stdout
    subprocess.run(['tar', '-x', '-C', destino], input=arch, check=True)
    return destino


class _Silencioso(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


def servir(carpeta, puerto):
    """Sirve una carpeta en localhost (el service worker funciona en localhost)."""
    socketserver.TCPServer.allow_reuse_address = True
    h = functools.partial(_Silencioso, directory=carpeta)
    srv = socketserver.ThreadingTCPServer(('127.0.0.1', puerto), h)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv


class Informe:
    def __init__(self):
        self.fallos = []

    def ok(self, cond, texto):
        print(('  OK    ' if cond else '  FALLO ') + texto)
        if not cond:
            self.fallos.append(texto)

    def fin(self):
        print('\n' + ('TODO CORRECTO' if not self.fallos else f'{len(self.fallos)} FALLOS:'))
        for f in self.fallos:
            print('  - ' + f)
        return 1 if self.fallos else 0
