<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cerealis — Conexión Rápida</title>
    @vite(['resources/css/app.css'])
</head>
<body style="background-image: url('{{ asset('cerealis-bg.png') }}')" class="relative flex h-screen flex-col items-center justify-center gap-12 bg-cover bg-top text-white before:absolute before:left-0 before:top-0 before:block before:h-screen before:w-screen before:content-[''] before:bg-black/0">

    <h1 class="z-10 text-center text-5xl font-extrabold md:text-6xl tracking-tight drop-shadow-lg">
        Conéctate a Cerealis 🌿
    </h1>

    <main class="z-10 grid w-full grid-cols-1 gap-8 px-8 md:grid-cols-2 lg:grid-cols-4">

        <!-- Paso 1 -->
        <div class="py-12 flex flex-col items-center gap-4 rounded-2xl border border-white/20 bg-black/50 p-6 text-center shadow-lg backdrop-blur-md transition hover:scale-105">
            <div class="flex shrink-0 h-16 w-16 items-center justify-center rounded-full border-2 border-[#ffffff] text-3xl font-bold text-[#ffffff]">1</div>
            <div class="flex flex-col items-center justify-center gap-3 h-full">
                <h2 class="text-2xl font-bold">Conecta tu Dispositivo</h2>
                <p class="text-white/80 text-lg">Únete a la red <span class="font-bold text-white">"Cerealis_Drone"</span>.</p>
                                <img class="w-48 rounded-lg border border-white/20" src="{{ asset('wifi-qr.png') }}" alt="Código QR de Cerealis">
            </div>
        </div>

        <div class="py-12 flex flex-col items-center gap-4 rounded-2xl border border-white/20 bg-black/50 p-6 text-center shadow-lg backdrop-blur-md transition hover:scale-105">
            <div class="shrink-0 flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#ffffff] text-3xl font-bold text-[#ffffff]">2</div>
            <div class="flex flex-col items-center justify-center gap-3 h-full">
                <h2 class="text-2xl font-bold">Escanea el QR</h2>
                <p class="text-white/80 text-lg">Apunta tu cámara y entra al panel de control.</p>
                <img class="w-48 rounded-lg border border-white/20" src="{{ asset('cerealis-qr.png') }}" alt="Código QR de Cerealis">
            </div>
        </div>

        <div class="py-12 flex flex-col items-center gap-4 rounded-2xl border border-white/20 bg-black/50 p-6 text-center shadow-lg backdrop-blur-md transition hover:scale-105">
            <div class="shrink-0 flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#ffffff] text-3xl font-bold text-[#ffffff]">3</div>
            <div class="flex flex-col items-center justify-center gap-3 h-full">
                <h2 class="text-2xl font-bold">Accede al Panel</h2>
                <div class="flex flex-col gap-3">
                    <div class="text-center space-y-1">
                        <p class="font-medium text-white/80">Usuario</p>
                        <h3 class="text-lg font-bold">demo@innovatec.com</h3>
                    </div>
                    <div class="text-center space-y-1">
                        <p class="font-medium text-white/80">Código</p>
                        <h1 class="rounded-lg bg-white px-8 py-3 text-4xl font-bold text-[#97b432]">{{ $password }}</h1>
                    </div>
                </div>
            </div>
        </div>

        <div class="py-12 flex flex-col items-center gap-4 rounded-2xl border border-white/20 bg-black/50 p-6 text-center shadow-lg backdrop-blur-md transition hover:scale-105">
            <div class="shrink-0 flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#ffffff] text-3xl font-bold text-[#ffffff]">4</div>
            <div class="flex flex-col items-center justify-center gap-3 h-full">
                <h2 class="text-2xl font-bold">Explora y Analiza</h2>
                <p class="text-white/80 text-lg">Controla el dron, revisa datos en vivo y planifica misiones.</p>
            </div>
        </div>

    </main>
</body>
</html>
