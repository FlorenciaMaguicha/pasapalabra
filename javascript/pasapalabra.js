document.addEventListener("DOMContentLoaded", () => {
    const sonidoCorrecto = new Audio('sonidos/correcto.mp3');
    const sonidoIncorrecto = new Audio('sonidos/incorrecto.mp3');

    let puntos = 0;
    const actualizarPuntos = () => {
        document.getElementById("puntos-valor").textContent = puntos;
    };

    Swal.fire({
        imageUrl: "https://iaf.ai/templates/yootheme/cache/74/logo-743dbd5b.webp",
        imageWidth: 100,
        imageHeight: 38,
        imageAlt: "Custom image",
        title: "🧠 ¡Bienvenido al juego de pasapalabra IAF! 🧠",
        html: `
            <p><b>🔹 Objetivo:</b> Completar el rosco en verde.</p>
            <p><b>🔹 Cómo jugar:</b><br>
            - Las preguntas se basan en la inteligencia artificial.<br>
            - Las respuestas se ingresan manualmente.<br>
            - Usá clic o Enter para responder.<br>
            - Si no sabés, clickeá PASAPALABRA.<br>
            - CORRECTA = verde, INCORRECTA = rojo.</p>
            <p><b>🔹 Reglas:</b><br>
            - Tenés <b>3 minutos</b> para completar el rosco.<br>
            - Si completás el rosco en verde, ganás. 🎉<br>
            - Si no lo hacés a tiempo o hay errores, perdés. 😣</p>
            <p>✨ ¡Buena suerte! ✨</p>
        `,
        confirmButtonText: "Te sentís capaz de completarlo?",
        confirmButtonColor: "#001aff"
    }).then(() => {
        document.getElementById("pantallaInicio").style.display = "flex";
    });

    const actualizarPuntaje = (respuestaCorrecta) => {
        if (respuestaCorrecta) {
            puntos += 10;
            sonidoCorrecto.play();
        } else {
            puntos -= 2;
            sonidoIncorrecto.play();
        }
        actualizarPuntos();
    };

    const pantallaInicio = document.getElementById("pantallaInicio");
    const btnInicio = document.getElementById("btnInicio");
    const contenedorJuego = document.querySelector(".contenedor");

    const rosco = document.getElementById("rosco");
    const preguntaTexto = document.getElementById("pregunta");
    const timerTexto = document.getElementById("timer");
    const inputRespuesta = document.getElementById("respuesta");
    const btnResponder = document.getElementById("btnResponder");
    const btnPasar = document.getElementById("btnPasar");
    const btnReiniciar = document.getElementById("btnReiniciar");

    let preguntas = [];
    let indice = 0;
    let tiempo = 180;
    let intervalo;

    function quitarAcentos(str) {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    const crearRosco = () => {
        [...rosco.querySelectorAll(".letra")].forEach(div => div.remove());
        const radio = 150;
        const centro = 150;
        const total = preguntas.length;

        preguntas.forEach((p, i) => {
            const ang = (2 * Math.PI * i) / total;
            const x = centro + radio * Math.cos(ang);
            const y = centro + radio * Math.sin(ang);

            const div = document.createElement("div");
            div.className = "letra";
            div.innerText = p.letra;
            div.style.left = `${x}px`;
            div.style.top = `${y}px`;

            if (i === indice) div.classList.add("activa");
            if (p.estado === 'correcta') div.classList.add("correcta");
            if (p.estado === 'incorrecta') div.classList.add("incorrecta");
            if (p.estado === 'pasapalabra') div.classList.add("pasapalabra");

            rosco.appendChild(div);
        });
    };

    const verificarRoscoCompleto = () => preguntas.every(p => p.estado === 'correcta');

    const verificarFinDelJuego = () => {
        if (verificarRoscoCompleto()) {
            Swal.fire({
                imageUrl: "https://iaf.ai/templates/yootheme/cache/74/logo-743dbd5b.webp",
                imageWidth: 100,
                imageHeight: 38,
                imageAlt: "Custom image",
                title: "🎉 ¡Ganaste! 🎉",
                html: `<p>¡Felicidades, completaste el rosco correctamente!</p><p><b>Puntaje final:</b> ${puntos} puntos</p>`,
                icon: "success",
                confirmButtonText: "Aceptar",
                confirmButtonColor: "#1f1f2f"
            }).then(() => {
                contenedorJuego.style.display = "none";
                pantallaInicio.style.display = "flex";
            });
            return true;
        }

        const quedanJugables = preguntas.some(p => p.estado === 'pendiente' || p.estado === 'pasapalabra');
        if (!quedanJugables) {
            Swal.fire({
                imageUrl: "https://iaf.ai/templates/yootheme/cache/74/logo-743dbd5b.webp",
                imageWidth: 100,
                imageHeight: 38,
                imageAlt: "Custom image",
                title: "❌ ¡Perdiste! ❌",
                html: `<p>Completaste el rosco pero con errores.</p><p><b>Puntaje final:</b> ${puntos} puntos</p>`,
                icon: "error",
                confirmButtonText: "Aceptar",
                confirmButtonColor: "#1f1f2f"
            }).then(() => {
                contenedorJuego.style.display = "none";
                pantallaInicio.style.display = "flex";
            });
            return true;
        }

        return false;
    };

    const mostrarPregunta = () => {
        preguntaTexto.innerText = preguntas[indice].pregunta;

        const letraCentral = document.getElementById("letra-central");
        if (letraCentral) {
            letraCentral.textContent = preguntas[indice].letra.toUpperCase();
        }

        crearRosco();
    };


    const verificarRespuesta = () => {
        btnResponder.disabled = true;
        btnPasar.disabled = true;

        const userResp = quitarAcentos(inputRespuesta.value.trim().toLowerCase());
        const correcta = quitarAcentos(preguntas[indice].respuesta.toLowerCase());
        const letraActual = document.querySelector(".letra.activa");

        if (userResp === correcta) {
            preguntas[indice].estado = 'correcta';
            letraActual?.classList.add("respuesta-correcta");
            actualizarPuntaje(true);
        } else {
            preguntas[indice].estado = 'incorrecta';
            letraActual?.classList.add("respuesta-incorrecta");
            actualizarPuntaje(false);
        }

        inputRespuesta.value = '';

        setTimeout(() => {
            letraActual?.classList.remove("respuesta-correcta", "respuesta-incorrecta");
            if (!verificarFinDelJuego()) {
                avanzarSinPausa();
                btnResponder.disabled = false;
                btnPasar.disabled = false;
            }
        }, 50);
    };

    const avanzarSinPausa = () => {
        if (preguntas[indice].estado === 'pendiente') {
            preguntas[indice].estado = 'pasapalabra';
        }

        let contador = 0;
        do {
            indice = (indice + 1) % preguntas.length;
            contador++;
        } while (
            (preguntas[indice].estado === 'correcta' || preguntas[indice].estado === 'incorrecta') &&
            contador < preguntas.length
        );

        mostrarPregunta();
    };

    const avanzarConPausa = () => {
        if (preguntas[indice].estado === 'pendiente') {
            preguntas[indice].estado = 'pasapalabra';
        }

        clearInterval(intervalo);

        const tiempoGuardado = tiempo;

        let descanso = 5;
        timerTexto.textContent = `Descanso: ${descanso}`;
        btnResponder.disabled = true;
        btnPasar.disabled = true;
        inputRespuesta.disabled = true;

        const pausaIntervalo = setInterval(() => {
            descanso--;
            if (descanso > 0) {
                timerTexto.textContent = `Descanso: ${descanso}`;
            } else {
                clearInterval(pausaIntervalo);
                btnResponder.disabled = false;
                btnPasar.disabled = false;
                inputRespuesta.disabled = false;

                tiempo = tiempoGuardado;
                timerTexto.textContent = tiempo;
                iniciarTemporizador();

                if (!verificarFinDelJuego()) {
                    avanzarSinPausa();
                }
            }
        }, 1000);
    };


    const iniciarTemporizador = () => {
        clearInterval(intervalo);
        timerTexto.textContent = tiempo;
        intervalo = setInterval(() => {
            if (tiempo > 0) {
                tiempo--;
                timerTexto.textContent = tiempo;
            }
            if (tiempo <= 0) {
                clearInterval(intervalo);
                Swal.fire({
                    imageUrl: "https://iaf.ai/templates/yootheme/cache/74/logo-743dbd5b.webp",
                    imageWidth: 100,
                    imageHeight: 38,
                    imageAlt: "Custom image",
                    title: "⏰ ¡Tiempo agotado! ⏰",
                    html: `<p>Se te acabó el tiempo y no completaste el rosco en verde.</p><p><b>Puntaje final:</b> ${puntos} puntos</p>`,
                    icon: "error",
                    confirmButtonText: "Jugar de nuevo",
                    confirmButtonColor: "#1f1f2f"
                }).then(() => {
                    preguntaTexto.innerText = "¡Juego terminado!";
                    inputRespuesta.disabled = true;
                    contenedorJuego.style.display = "none";
                    pantallaInicio.style.display = "flex";
                });
            }
        }, 1000);
    };

    const seleccionarPreguntas = datos => {
        preguntas = datos.map(item => {
            const rand = Math.floor(Math.random() * item.opciones.length);
            const seleccionada = item.opciones[rand];
            return {
                letra: item.letra,
                pregunta: seleccionada.pregunta,
                respuesta: seleccionada.respuesta,
                estado: 'pendiente'
            };
        });
    };

    const reiniciarJuego = async () => {
        clearInterval(intervalo);
        try {
            const res = await fetch("datos/base-de-datos.json");
            const datos = await res.json();
            seleccionarPreguntas(datos);
            indice = 0;
            puntos = 0;
            actualizarPuntos();
            inputRespuesta.disabled = false;
            inputRespuesta.value = '';
            iniciarTemporizador();
            mostrarPregunta();
        } catch (error) {
            preguntaTexto.innerText = "Error al cargar preguntas.";
            console.error("Error al cargar JSON:", error);
        }
    };

    btnInicio.addEventListener("click", () => {
        pantallaInicio.style.display = "none";
        contenedorJuego.style.display = "block";
        reiniciarJuego();
    });

    btnResponder.onclick = verificarRespuesta;
    btnPasar.onclick = avanzarConPausa;
    btnReiniciar.onclick = reiniciarJuego;
    inputRespuesta.addEventListener("keydown", e => e.key === "Enter" && verificarRespuesta());
});
