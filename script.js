/**
 * TALLER IT | 3D COSMIC PARTICLE ENGINE & INTERACTIVITY
 * Inspired by USTA Agency 3D WebGL Particle System
 */

document.addEventListener('DOMContentLoaded', () => {
    // =========================================================================
    // 1. THREE.JS 3D COSMIC PARTICLE ENGINE
    // =========================================================================
    const canvas = document.getElementById('webgl-canvas');
    if (!canvas || typeof THREE === 'undefined') {
        console.warn('Three.js canvas or library not found.');
        return;
    }

    const scene = new THREE.Scene();
    // Deep cosmic fog for realistic depth
    scene.fog = new THREE.FogExp2(0x020204, 0.012);

    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 70;

    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Glow Texture Generator for Stardust Particles
    function createGlowTexture() {
        const size = 64;
        const c = document.createElement('canvas');
        c.width = size;
        c.height = size;
        const ctx = c.getContext('2d');

        const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.85)');
        gradient.addColorStop(0.5, 'rgba(120, 200, 255, 0.35)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);

        const texture = new THREE.CanvasTexture(c);
        texture.needsUpdate = true;
        return texture;
    }

    const particleTexture = createGlowTexture();

    // -------------------------------------------------------------------------
    // Background Starfield (Deep Ambient Cosmos)
    // -------------------------------------------------------------------------
    const starCount = 1200;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
        const i3 = i * 3;
        starPositions[i3] = (Math.random() - 0.5) * 350;
        starPositions[i3 + 1] = (Math.random() - 0.5) * 350;
        starPositions[i3 + 2] = (Math.random() - 0.5) * 250 - 50;

        // Subtle white and soft cyan stars
        const isCyan = Math.random() > 0.65;
        starColors[i3] = isCyan ? 0.6 : 0.9;
        starColors[i3 + 1] = isCyan ? 0.85 : 0.9;
        starColors[i3 + 2] = 1.0;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMaterial = new THREE.PointsMaterial({
        size: 1.2,
        map: particleTexture,
        transparent: true,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
        depthWrite: false,
        opacity: 0.7
    });

    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);

    // -------------------------------------------------------------------------
    // Main Interactive 3D Morphing Particle System
    // Shapes: 0 = Rocket, 1 = Satellite, 2 = Neural Orb, 3 = Astronaut
    // -------------------------------------------------------------------------
    const PARTICLE_COUNT = 3200;
    const shapes = [[], [], [], []];
    const particleColors = new Float32Array(PARTICLE_COUNT * 3);

    // Color Palettes: Gold Amber & Electric Cyan
    const COLOR_GOLD = new THREE.Color('#fbbf24');
    const COLOR_AMBER = new THREE.Color('#f59e0b');
    const COLOR_CYAN = new THREE.Color('#38bdf8');
    const COLOR_WHITE = new THREE.Color('#ffffff');
    const COLOR_ICE = new THREE.Color('#67e8f9');

    // Helper random in sphere
    function rndSphere(radius) {
        const u = Math.random();
        const v = Math.random();
        const theta = u * 2.0 * Math.PI;
        const phi = Math.acos(2.0 * v - 1.0);
        const r = Math.cbrt(Math.random()) * radius;
        return {
            x: r * Math.sin(phi) * Math.cos(theta),
            y: r * Math.sin(phi) * Math.sin(theta),
            z: r * Math.cos(phi)
        };
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        // --- SHAPE 0: ROCKET (Aligned diagonally ~45° like in the reference video) ---
        let rX, rY, rZ;
        const rocketPart = i / PARTICLE_COUNT;

        if (rocketPart < 0.45) {
            // Fuselage & Cabin (Cylinder to Cone)
            const t = Math.random(); // 0 to 1 along length
            const rad = Math.sin(t * Math.PI * 0.85) * (8 * (1 - t * 0.6));
            const angle = Math.random() * Math.PI * 2;
            const len = (t - 0.5) * 36;

            rX = len + (Math.random() - 0.5) * 1.5;
            rY = Math.cos(angle) * rad;
            rZ = Math.sin(angle) * rad;

            // Rotate fuselage ~45 deg to point upwards-right
            const rotA = 0.65;
            const rx2 = rX * Math.cos(rotA) - rY * Math.sin(rotA) + 8;
            const ry2 = rX * Math.sin(rotA) + rY * Math.cos(rotA) + 2;
            rX = rx2; rY = ry2;
        } else if (rocketPart < 0.65) {
            // Stabilizer Wings / Fins
            const wingSide = (i % 2 === 0) ? 1 : -1;
            const wingT = Math.random();
            const wingSpan = wingT * 14 * wingSide;
            const wingLen = -10 + (Math.random() - 0.5) * 8;

            rX = wingLen;
            rY = wingSpan;
            rZ = (Math.random() - 0.5) * 2;

            const rotA = 0.65;
            const rx2 = rX * Math.cos(rotA) - rY * Math.sin(rotA) + 8;
            const ry2 = rX * Math.sin(rotA) + rY * Math.cos(rotA) + 2;
            rX = rx2; rY = ry2;
        } else {
            // Thruster Jet Fire & Particle Smoke Trail (Vibrant Amber/Gold)
            const flameT = Math.random();
            const spread = flameT * 12;
            const flameLen = -12 - flameT * 28 - Math.random() * 8;
            const fAngle = Math.random() * Math.PI * 2;

            rX = flameLen;
            rY = Math.cos(fAngle) * (Math.random() * spread);
            rZ = Math.sin(fAngle) * (Math.random() * spread);

            const rotA = 0.65;
            const rx2 = rX * Math.cos(rotA) - rY * Math.sin(rotA) + 8;
            const ry2 = rX * Math.sin(rotA) + rY * Math.cos(rotA) + 2;
            rX = rx2; rY = ry2;
        }
        shapes[0].push(rX, rY, rZ);

        // --- SHAPE 1: SATELLITE & NETWORK NODES ---
        let sX, sY, sZ;
        const satPart = i / PARTICLE_COUNT;

        if (satPart < 0.35) {
            // Central Satellite Module & Antenna Dish
            const p = rndSphere(9);
            sX = p.x;
            sY = p.y;
            sZ = p.z;
        } else if (satPart < 0.75) {
            // Solar Panels (Dual Wings on Left & Right)
            const side = (i % 2 === 0) ? 1 : -1;
            const panelX = side * (12 + Math.random() * 18);
            const panelY = (Math.random() - 0.5) * 14;
            const panelZ = (Math.random() - 0.5) * 2.5;
            sX = panelX;
            sY = panelY;
            sZ = panelZ;
        } else {
            // Orbiting Communication Rings / Signal Waves
            const ringAngle = Math.random() * Math.PI * 2;
            const ringRad = 24 + Math.random() * 6;
            sX = Math.cos(ringAngle) * ringRad;
            sY = Math.sin(ringAngle) * ringRad * 0.45;
            sZ = (Math.random() - 0.5) * 5;
        }
        shapes[1].push(sX + 8, sY, sZ);

        // --- SHAPE 2: NEURAL ORB / CYBER EYE (VISIÓN IA) ---
        let oX, oY, oZ;
        const orbPart = i / PARTICLE_COUNT;

        if (orbPart < 0.4) {
            // Core Dense Nucleus / Iris
            const p = rndSphere(11);
            oX = p.x;
            oY = p.y;
            oZ = p.z;
        } else if (orbPart < 0.75) {
            // Inclined Data Planetary Ring 1
            const rAng = Math.random() * Math.PI * 2;
            const rRad = 22 + Math.random() * 7;
            const rx = Math.cos(rAng) * rRad;
            const ry = Math.sin(rAng) * rRad;
            // Tilt ~35 deg
            oX = rx;
            oY = ry * Math.cos(0.6) - (Math.random() - 0.5) * 2;
            oZ = ry * Math.sin(0.6);
        } else {
            // Second Counter-tilted Ring
            const rAng = Math.random() * Math.PI * 2;
            const rRad = 28 + Math.random() * 6;
            const rx = Math.cos(rAng) * rRad;
            const ry = Math.sin(rAng) * rRad;
            oX = rx * Math.cos(-0.7) - (Math.random() - 0.5) * 2;
            oY = ry;
            oZ = rx * Math.sin(-0.7);
        }
        shapes[2].push(oX + 6, oY, oZ);

        // --- SHAPE 3: ASTRONAUT (COSMIC GREETING) ---
        let aX, aY, aZ;
        const astroPart = i / PARTICLE_COUNT;

        if (astroPart < 0.25) {
            // Helmet (Sphere with bright visor)
            const p = rndSphere(7);
            aX = p.x;
            aY = p.y + 16;
            aZ = p.z;
        } else if (astroPart < 0.55) {
            // Torso & Life-Support Backpack
            aX = (Math.random() - 0.5) * 11;
            aY = 2 + (Math.random() - 0.5) * 14;
            aZ = (Math.random() - 0.5) * 8;
        } else if (astroPart < 0.75) {
            // Right Arm Waving Hello!
            const armT = Math.random();
            aX = 6 + armT * 12 + Math.sin(armT * 3) * 2;
            aY = 8 + armT * 14 + (Math.random() - 0.5) * 3;
            aZ = 3 + (Math.random() - 0.5) * 4;
        } else {
            // Legs in zero-gravity float
            const legSide = (i % 2 === 0) ? 1 : -1;
            const legT = Math.random();
            aX = legSide * (4 + legT * 3);
            aY = -6 - legT * 16;
            aZ = (Math.random() - 0.5) * 6 + legT * 4;
        }
        shapes[3].push(aX, aY, aZ);

        // --- Vertex Colors Assignment ---
        // Mixture of Golden Amber and Electric Cyan / Ice
        const c3 = i * 3;
        let c;
        if (i % 3 === 0) {
            c = COLOR_GOLD.clone().lerp(COLOR_AMBER, Math.random());
        } else if (i % 3 === 1) {
            c = COLOR_CYAN.clone().lerp(COLOR_WHITE, Math.random() * 0.6);
        } else {
            c = COLOR_ICE.clone().lerp(COLOR_GOLD, Math.random() * 0.3);
        }

        particleColors[c3] = c.r;
        particleColors[c3 + 1] = c.g;
        particleColors[c3 + 2] = c.b;
    }

    // Dynamic Positions Array
    const currentPositions = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT * 3; i++) {
        currentPositions[i] = shapes[0][i];
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(currentPositions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMaterial = new THREE.PointsMaterial({
        size: 1.85,
        map: particleTexture,
        transparent: true,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
        depthWrite: false,
        opacity: 0.92
    });

    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);

    // -------------------------------------------------------------------------
    // Morphing Engine & Scroll Tracking
    // -------------------------------------------------------------------------
    let currentShapeIndex = 0;
    let targetShapeIndex = 0;
    let morphFactor = 0; // 0 to 1 between current and target
    let scrollProgress = 0; // 0 to 3

    const shapeNames = [
        'COHETE / DESPEGUE',
        'SATÉLITE / SOLUCIONES',
        'NEURAL ORB / VISIÓN IA',
        'ASTRONAUTA / HABLEMOS'
    ];

    const shapeNameEl = document.getElementById('current-shape-name');
    const navItems = document.querySelectorAll('.nav-item');
    const railMarkers = document.querySelectorAll('.rail-marker');
    const scrollBar = document.getElementById('scroll-bar');

    function updateScrollState() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const overallRatio = scrollHeight > 0 ? Math.min(Math.max(scrollTop / scrollHeight, 0), 1) : 0;

        // 4 scenes -> 3 intervals between them: [0..1], [1..2], [2..3]
        const scaled = overallRatio * 3;
        const currentIdx = Math.floor(scaled);
        const nextIdx = Math.min(currentIdx + 1, 3);
        const fraction = scaled - currentIdx;

        // Smooth cubic ease for morph transition
        const easeFraction = fraction * fraction * (3 - 2 * fraction);

        currentShapeIndex = currentIdx;
        targetShapeIndex = nextIdx;
        morphFactor = easeFraction;

        // Update HUD indicators
        const activeIdx = Math.round(scaled);
        if (shapeNameEl && shapeNames[activeIdx]) {
            shapeNameEl.innerText = shapeNames[activeIdx];
        }

        // Active Nav links
        navItems.forEach((item, idx) => {
            if (idx === activeIdx) item.classList.add('active');
            else item.classList.remove('active');
        });

        // Active Rail Markers
        railMarkers.forEach((m, idx) => {
            if (idx === activeIdx) m.classList.add('active');
            else m.classList.remove('active');
        });

        // Scroll Bar height
        if (scrollBar) {
            scrollBar.style.height = `${overallRatio * 100}%`;
        }
    }

    window.addEventListener('scroll', updateScrollState, { passive: true });
    updateScrollState();

    // -------------------------------------------------------------------------
    // Mouse Interaction & Parallax
    // -------------------------------------------------------------------------
    let mouseX = 0;
    let mouseY = 0;
    let targetRotX = 0;
    let targetRotY = 0;

    window.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.clientY / window.innerHeight) * 2 + 1;

        targetRotY = mouseX * 0.35;
        targetRotX = -mouseY * 0.25;
    });

    // -------------------------------------------------------------------------
    // Render Loop with Dynamic Particle Waves
    // -------------------------------------------------------------------------
    let clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        const delta = clock.getDelta();
        const time = clock.getElapsedTime();

        // Smooth camera / scene tilt from mouse parallax
        particleSystem.rotation.y += (targetRotY - particleSystem.rotation.y) * 0.05;
        particleSystem.rotation.x += (targetRotX - particleSystem.rotation.x) * 0.05;

        // Starfield gentle rotation
        starField.rotation.y = time * 0.015;
        starField.rotation.x = time * 0.008;

        // Morph particles between shapes
        const positions = particleGeometry.attributes.position.array;
        const s1 = shapes[currentShapeIndex];
        const s2 = shapes[targetShapeIndex];

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const i3 = i * 3;

            // Base interpolated target position
            const x1 = s1[i3], y1 = s1[i3 + 1], z1 = s1[i3 + 2];
            const x2 = s2[i3], y2 = s2[i3 + 1], z2 = s2[i3 + 2];

            const tx = x1 + (x2 - x1) * morphFactor;
            const ty = y1 + (y2 - y1) * morphFactor;
            const tz = z1 + (z2 - z1) * morphFactor;

            // Cosmic plasma fluid turbulence (Brownian micro-drift)
            const wave = Math.sin(time * 2.2 + i * 0.12) * 0.45;
            const waveCos = Math.cos(time * 1.8 + i * 0.15) * 0.45;

            // Smooth spring lerp to target
            positions[i3] += (tx + wave - positions[i3]) * 0.08;
            positions[i3 + 1] += (ty + waveCos - positions[i3 + 1]) * 0.08;
            positions[i3 + 2] += (tz - positions[i3 + 2]) * 0.08;
        }

        particleGeometry.attributes.position.needsUpdate = true;
        renderer.render(scene, camera);
    }

    animate();

    // Window Resize Handler
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // =========================================================================
    // 2. MODALS & CASE STUDIES INTERACTIVITY
    // =========================================================================
    const serviceData = {
        'digitalizacion': {
            title: 'Podal Fix: Gestión Podológica',
            desc: `Podal Fix es la herramienta definitiva para la gestión de salud podal bovina y bienestar animal. Diseñada para transformar el trabajo de campo en una experiencia digital fluida, permite un seguimiento quirúrgico de cada animal, centralizando la información técnica y administrativa en un solo lugar.<br><br>
            <strong>💎 Funcionalidades Clave</strong><br>
            • <b>Dashboard de Analytics:</b> Métricas críticas sobre el estado del rodeo y eficacia de tratamientos en tiempo real.<br>
            • <b>Mapa Clínico Interactivo:</b> Registro visual y detallado de patologías por pezuña con interfaz táctil avanzada.<br>
            • <b>Gestión Multi-Establecimiento:</b> Control centralizado de múltiples rodeos, clientes y locaciones geográficas.<br>
            • <b>Historias Clínicas 360°:</b> Acceso instantáneo al historial completo, tratamientos previos y evolución de cada animal.<br>
            • <b>Operatividad Total:</b> Interfaz optimizada para velocidad instantánea en tablets y celulares durante las inspecciones.<br><br>
            <strong>🔮 Visión de Futuro: El Nexo Digital</strong><br>
            • Sincronización Offline inteligente para zonas sin cobertura rural.<br>
            • Reportes Automáticos exportables para dueños de establecimientos.<br>
            • Galería de Imágenes Clínicas integrada en cada ficha de animal.`,
            icon: '📋',
            images: [
                'assets/podal_1.jpg',
                'assets/podal_2.jpg',
                'assets/podal_3.jpg',
                'assets/podal_4.jpg',
                'assets/podal_5.jpg'
            ],
            link: 'https://podalfix.vercel.app/'
        },
        'pilates': {
            title: 'Gestión Flex: Sistema Inteligente',
            desc: `Gestión Flex es una herramienta de precisión diseñada para potenciar la administración de estudios de pilates, gimnasios y centros de bienestar. La plataforma delega las tareas administrativas pesadas para enfocarse en los alumnos y el equipo docente.<br><br>
            <strong>💎 Funcionalidades Actuales (Beta Abierta)</strong><br>
            • <b>Gestión Centralizada:</b> Registro minucioso de alumnos, control de cuotas y seguimiento de disciplinas.<br>
            • <b>Portal Profesional Independiente:</b> Acceso exclusivo para instructores con sus propios alumnos, turnos asignados y liquidación mensual estimada.<br>
            • <b>Agenda Semanal Dinámica:</b> Cuadrícula visual de todos los horarios programados del establecimiento.<br>
            • <b>Inteligencia Financiera:</b> Panel completo con cruce de ingresos, gastos operativos, honorarios y balance neto.<br>
            • <b>Reportes One-Click:</b> Exportador instantáneo a PDF y planillas operativas para agilizar cierres de mes.<br>
            • <b>Mobile First:</b> Experiencia 100% responsiva diseñada para usar con una mano en el teléfono.`,
            icon: '🧘',
            link: 'https://gestion-flex.vercel.app/'
        },
        'moai': {
            title: 'Moai Eco Adventure: Plataforma de Turismo & B2B',
            desc: `Moai Eco Adventure es una plataforma integral de ecoturismo y eventos vivenciales para particulares y corporaciones, desarrollada para inspirar la conexión con la naturaleza a través del deporte y la aventura.<br><br>
            <strong>💎 Funcionalidades Clave</strong><br>
            • <b>Marketplace de Aventuras:</b> Catálogo interactivo de experiencias (Parapente, Mountain Bike, Surf, Trekking) con filtros dinámicos por categoría, fecha y tipo de público.<br>
            • <b>Módulo Corporativo B2B:</b> Solución dedicada a retiros de empresas, team building y jornadas al aire libre con cotizador inteligente de eventos.<br>
            • <b>Club Moai & Beneficios:</b> Sistema de membresía y fidelización con acceso preferencial a salidas grupales.<br>
            • <b>Consola Administrativa Central:</b> Gestión completa de reservas, leads comerciales, postulaciones de instructores y catálogo de actividades.<br>
            • <b>Rendimiento Ultra Veloz:</b> Construido sobre stack moderno (React + Vite), optimizado para carga inmediata y máxima conversión en dispositivos móviles.`,
            icon: '🗿',
            images: [
                'assets/moai_1.jpg',
                'assets/moai_2.jpg',
                'assets/moai_3.jpg'
            ],
            link: 'https://moai-eco-adventure.vercel.app/'
        },
        'gestion': {
            title: 'Toca Tocar: Plataforma de Eventos',
            desc: `Toca Tocar es el nexo digital definitivo para coordinar Jam Sessions y eventos musicales en vivo. Diseñada para ordenar el caos creativo, permite gestionar repertorios compartidos, instrumentos y line-ups en tiempo real.<br><br>
            <strong>💎 Funcionalidades Destacadas</strong><br>
            • <b>Gestión de Jams Dinámica:</b> Creación de eventos con códigos de acceso únicos.<br>
            • <b>Dashboard de Músicos:</b> Visualización en vivo de participantes e instrumentos (saxo, piano, bajo, batería).<br>
            • <b>Base de Standards:</b> Soporte para partituras y charts de acordes directamente en la app.<br>
            • <b>Chat en Vivo por Tema:</b> Coordinación inmediata antes de subir al escenario.`,
            icon: '⚙️',
            link: 'https://toca-tocar.vercel.app/'
        },
        'vision': {
            title: 'Visión IT: Visión Artificial & Deep Learning',
            desc: `Visión IT es un motor de inspección óptica inteligente que utiliza redes neuronales convolucionales para comprender transmisiones de video en vivo con tiempos de inferencia ultra-bajos.<br><br>
            <strong>💎 Capacidades Actuales</strong><br>
            • <b>Detección Óptica en Tiempo Real:</b> Identificación de patrones y objetos en el navegador con aceleración GPU.<br>
            • <b>Alertas Críticas Automatizadas:</b> Notificaciones directas a canales de Telegram o endpoints webhook ante eventos específicos.<br>
            • <b>Consola de Sensibilidad Dinámica:</b> Calibración al vuelo de umbrales de confianza para distintos escenarios de iluminación.<br><br>
            <strong>🔮 Aplicaciones Industriales</strong><br>
            • Conteo automático y auditoría en líneas de empaque.<br>
            • Control de calidad y detección de anomalías en piezas de manufactura.<br>
            • Seguridad e inspección perimetral sin intervención humana.`,
            icon: '👁️',
            link: 'https://vision-it-six.vercel.app/'
        },
        'chatbot': {
            title: 'Chatbots & Automatización con IA',
            desc: `Automatización integral de canales de comunicación mediante agentes conversacionales potenciados por modelos de lenguaje (LLMs).<br><br>
            <strong>💎 Qué Resolvemos</strong><br>
            • Atención 24/7 sin tiempos de espera en WhatsApp e Instagram.<br>
            • Calificación automática de prospectos y agenda de reuniones sincronizada con Google Calendar.<br>
            • Conexión con tus bases de datos internas para consultar stock o estados de pedidos al instante.`,
            icon: '🤖'
        }
    };

    const modal = document.getElementById('service-modal');
    const modalBody = document.getElementById('modal-body');
    const closeModalBtn = document.getElementById('close-modal');

    // Cards click triggers
    document.querySelectorAll('.hud-card').forEach(card => {
        const key = card.getAttribute('data-key');
        if (!key) return;

        card.addEventListener('click', () => {
            openServiceModal(key);
        });
    });

    // Vision box trigger
    const visionBoxBtn = document.getElementById('open-vision-case');
    if (visionBoxBtn) {
        visionBoxBtn.addEventListener('click', () => {
            openServiceModal('vision');
        });
    }

    function openServiceModal(key) {
        const data = serviceData[key];
        if (!data) return;

        let content = `
            <div style="text-align: center; margin-bottom: 1.5rem;">
                <span style="font-size: 3.5rem; display: block; filter: drop-shadow(0 0 15px rgba(56, 189, 248, 0.4));">${data.icon}</span>
                <h2 style="margin-top: 0.8rem; font-family: var(--font-display); font-size: 1.8rem; color: #fff;">${data.title}</h2>
            </div>
        `;

        if (data.images && data.images.length > 0) {
            content += `
                <div style="position: relative; margin: 1.8rem 0; width: 100%; border-radius: 18px; overflow: hidden; background: #060911; border: 1px solid rgba(56, 189, 248, 0.25);">
                    <button class="carousel-btn prev-btn" onclick="javascript:this.nextElementSibling.scrollBy({left: -320, behavior: 'smooth'})">❮</button>
                    <div class="carousel-container" style="display: flex; gap: 0; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; -ms-overflow-style: none;">
                        ${data.images.map(img => `<img src="${img}" alt="${data.title}" style="scroll-snap-align: center; flex: 0 0 100%; width: 100%; object-fit: contain; max-height: 400px; display: block;">`).join('')}
                    </div>
                    <button class="carousel-btn next-btn" onclick="javascript:this.previousElementSibling.scrollBy({left: 320, behavior: 'smooth'})">❯</button>
                </div>
            `;
        }

        content += `
            <div style="color: rgba(226, 232, 240, 0.85); font-size: 1rem; line-height: 1.7; margin-bottom: 1.5rem;">
                ${data.desc}
            </div>
        `;

        if (data.link) {
            content += `
                <div style="text-align: center; margin-top: 2rem;">
                    <a href="${data.link}" target="_blank" class="btn-cosmic-primary">
                        <span>Ver Aplicación en Vivo</span>
                        <span>↗</span>
                    </a>
                </div>
            `;
        }

        modalBody.innerHTML = content;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    const closeModal = () => {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    };

    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    // =========================================================================
    // 3. CONTACT FORM MODAL
    // =========================================================================
    const contactModal = document.getElementById('contact-modal');
    const emailTrigger = document.getElementById('email-trigger');
    const closeContactBtn = document.getElementById('close-contact-modal');
    const contactForm = document.getElementById('contact-form');

    if (emailTrigger) {
        emailTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            contactModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    const closeContactModal = () => {
        contactModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    };

    if (closeContactBtn) closeContactBtn.addEventListener('click', closeContactModal);
    if (contactModal) {
        contactModal.addEventListener('click', (e) => {
            if (e.target === contactModal) closeContactModal();
        });
    }

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button');
            const originalHtml = btn.innerHTML;
            btn.innerHTML = '<span>Enviando mensaje...</span>';
            btn.disabled = true;

            setTimeout(() => {
                btn.innerHTML = '<span>¡Mensaje Enviado con Éxito! ✓</span>';
                btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                btn.style.borderColor = '#34d399';

                setTimeout(() => {
                    closeContactModal();
                    contactForm.reset();
                    btn.innerHTML = originalHtml;
                    btn.style.background = '';
                    btn.style.borderColor = '';
                    btn.disabled = false;
                }, 2200);
            }, 1200);
        });
    }

    // Escape Key Handler for all modals
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
            closeContactModal();
        }
    });

    // Smooth Rail Navigation Clicks
    railMarkers.forEach(marker => {
        marker.addEventListener('click', () => {
            const targetIndex = parseInt(marker.getAttribute('data-target'));
            const targetSection = document.querySelector(`.scene-section[data-index="${targetIndex}"]`);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});
