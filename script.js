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
    // Advanced 3D Morphing Particle Engine: Continuous Cosmic Matter
    // Shapes: 0 = Rocket, 1 = Satellite, 2 = Neural Eye, 3 = Astronaut
    // -------------------------------------------------------------------------
    const PARTICLE_COUNT = 4500;
    const shapes = [[], [], [], []];
    const particleColors = new Float32Array(PARTICLE_COUNT * 3);
    const particleDispersions = new Float32Array(PARTICLE_COUNT * 3); // Vortex dispersion trajectory per particle

    // Color Palettes
    const COLOR_GOLD = new THREE.Color('#fbbf24');
    const COLOR_AMBER = new THREE.Color('#f59e0b');
    const COLOR_CYAN = new THREE.Color('#38bdf8');
    const COLOR_WHITE = new THREE.Color('#ffffff');
    const COLOR_ICE = new THREE.Color('#bae6fd');
    const COLOR_DEEP_CYAN = new THREE.Color('#0284c7');

    // Helper: Surface point on a cylinder
    function cylinderShell(radius, height) {
        const theta = Math.random() * Math.PI * 2;
        const h = (Math.random() - 0.5) * height;
        return {
            x: Math.cos(theta) * radius,
            y: h,
            z: Math.sin(theta) * radius
        };
    }

    // Helper: Point on sphere shell
    function sphereShell(radius, thickness = 0.8) {
        const u = Math.random();
        const v = Math.random();
        const theta = u * 2.0 * Math.PI;
        const phi = Math.acos(2.0 * v - 1.0);
        const r = radius - Math.random() * thickness;
        return {
            x: r * Math.sin(phi) * Math.cos(theta),
            y: r * Math.sin(phi) * Math.sin(theta),
            z: r * Math.cos(phi)
        };
    }

    // Generate random swirling dispersion vectors for matter transitions
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        const ang = Math.random() * Math.PI * 2;
        const dist = 30 + Math.random() * 60;
        particleDispersions[i3] = Math.cos(ang) * dist + (Math.random() - 0.5) * 20;
        particleDispersions[i3 + 1] = (Math.random() - 0.5) * 80;
        particleDispersions[i3 + 2] = Math.sin(ang) * dist + (Math.random() - 0.5) * 35;
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const ratio = i / PARTICLE_COUNT;

        // =====================================================================
        // SHAPE 0: HIGH-DEFINITION ROCKET (Aligned 45° launch angle)
        // =====================================================================
        let rX, rY, rZ;
        if (ratio < 0.35) {
            // Main Fuselage (Tapered Shell)
            const t = Math.random();
            const rad = 6.8 * Math.sin(t * Math.PI * 0.9) * (1 - t * 0.45);
            const ang = Math.random() * Math.PI * 2;
            const len = (t - 0.45) * 38;
            rX = len;
            rY = Math.cos(ang) * rad;
            rZ = Math.sin(ang) * rad;
        } else if (ratio < 0.50) {
            // Cabin Glass / Visor Ring
            const ringAng = Math.random() * Math.PI * 2;
            const ringR = 5.2 + Math.random() * 0.8;
            rX = 6 + (Math.random() - 0.5) * 2;
            rY = Math.cos(ringAng) * ringR;
            rZ = Math.sin(ringAng) * ringR;
        } else if (ratio < 0.70) {
            // 3 Triangular Wings / Fins
            const finIdx = i % 3;
            const finBaseAng = (finIdx * Math.PI * 2) / 3;
            const finT = Math.random();
            const finSpan = 6 + finT * 12;
            const finLen = -10 - finT * 8 + (Math.random() - 0.5) * 2;
            rX = finLen;
            rY = Math.cos(finBaseAng) * finSpan + (Math.random() - 0.5) * 0.8;
            rZ = Math.sin(finBaseAng) * finSpan + (Math.random() - 0.5) * 0.8;
        } else {
            // Thruster Exhaust Cone & High-Energy Plasma Trail
            const tFlame = Math.random();
            const flameLen = -14 - Math.pow(tFlame, 1.4) * 36;
            const spread = 2.5 + tFlame * 10;
            const fAng = Math.random() * Math.PI * 2;
            rX = flameLen;
            rY = Math.cos(fAng) * (Math.random() * spread);
            rZ = Math.sin(fAng) * (Math.random() * spread);
        }
        // Rotate 45 deg to point upwards-right
        const rRot = 0.72;
        const rxRot = rX * Math.cos(rRot) - rY * Math.sin(rRot) + 8;
        const ryRot = rX * Math.sin(rRot) + rY * Math.cos(rRot) + 2;
        shapes[0].push(rxRot, ryRot, rZ);

        // =====================================================================
        // SHAPE 1: HIGH-DEFINITION SATELLITE (Central Core + Solar Wings + Dish)
        // =====================================================================
        let sX, sY, sZ;
        if (ratio < 0.28) {
            // Cubical / Cylindrical Main Body
            const cyl = cylinderShell(7.5, 12);
            sX = cyl.x;
            sY = cyl.y;
            sZ = cyl.z;
        } else if (ratio < 0.68) {
            // Solar Panel Arrays (Left & Right Grids)
            const side = (i % 2 === 0) ? 1 : -1;
            const panelW = 12 + Math.random() * 22; // Extended wing span
            const panelH = (Math.random() - 0.5) * 11;
            const panelThick = (Math.random() - 0.5) * 0.8;
            sX = side * panelW;
            sY = panelH;
            sZ = panelThick;
        } else if (ratio < 0.82) {
            // Parabolic High-Gain Dish Antenna
            const dishAng = Math.random() * Math.PI * 2;
            const dishRad = Math.random() * 8.5;
            const dishCurve = Math.pow(dishRad / 8.5, 2) * 4;
            sX = Math.cos(dishAng) * dishRad;
            sY = 9 + dishCurve + (Math.random() - 0.5) * 0.8;
            sZ = Math.sin(dishAng) * dishRad;
        } else {
            // Communication Beacon Rings
            const bAng = Math.random() * Math.PI * 2;
            const bRad = 24 + Math.random() * 5;
            sX = Math.cos(bAng) * bRad;
            sY = Math.sin(bAng) * (bRad * 0.35);
            sZ = (Math.random() - 0.5) * 3;
        }
        shapes[1].push(sX + 8, sY, sZ);

        // =====================================================================
        // SHAPE 2: HIGH-DEFINITION CYBER EYE / NEURAL ORB
        // =====================================================================
        let oX, oY, oZ;
        if (ratio < 0.35) {
            // Concentric Iris & Dense Pupil
            const irisAng = Math.random() * Math.PI * 2;
            const irisRad = Math.random() * 9.5;
            oX = Math.cos(irisAng) * irisRad;
            oY = Math.sin(irisAng) * irisRad;
            oZ = Math.sqrt(Math.max(0, 100 - (oX * oX + oY * oY))) * 0.45;
        } else if (ratio < 0.70) {
            // Primary Orbital Sensor Ring
            const ringAng = Math.random() * Math.PI * 2;
            const ringR = 21 + Math.random() * 3.5;
            const rx = Math.cos(ringAng) * ringR;
            const ry = Math.sin(ringAng) * ringR;
            // 40° inclination
            oX = rx;
            oY = ry * Math.cos(0.68) + (Math.random() - 0.5) * 1.5;
            oZ = ry * Math.sin(0.68);
        } else {
            // Secondary Transverse Ring
            const ringAng = Math.random() * Math.PI * 2;
            const ringR = 27 + Math.random() * 4;
            const rx = Math.cos(ringAng) * ringR;
            const ry = Math.sin(ringAng) * ringR;
            oX = rx * Math.cos(-0.75);
            oY = ry;
            oZ = rx * Math.sin(-0.75) + (Math.random() - 0.5) * 1.5;
        }
        shapes[2].push(oX + 6, oY, oZ);

        // =====================================================================
        // SHAPE 3: HIGH-DEFINITION ASTRONAUT (Clear Helmet, Visor, Backpack & Greeting Arm)
        // =====================================================================
        let aX, aY, aZ;
        if (ratio < 0.20) {
            // Curved Gold Visor (Distinct dense curved arc on the front of helmet)
            const vAngH = (Math.random() - 0.5) * Math.PI * 0.75; // Front arc -67° to +67°
            const vAngV = (Math.random() - 0.5) * Math.PI * 0.55;
            const vR = 6.4 + (Math.random() - 0.5) * 0.5;
            aX = Math.sin(vAngH) * vR * Math.cos(vAngV);
            aY = 17 + Math.sin(vAngV) * vR;
            aZ = Math.cos(vAngH) * vR * Math.cos(vAngV) + 1.2; // Protrudes forward
        } else if (ratio < 0.38) {
            // Helmet Outer Dome (Back & Sides)
            const hPt = sphereShell(7.2, 0.9);
            aX = hPt.x;
            aY = hPt.y + 17;
            aZ = hPt.z - 0.4;
        } else if (ratio < 0.56) {
            // Torso & Shoulders
            const tCyl = cylinderShell(6.2, 12);
            aX = tCyl.x * 1.05;
            aY = 4 + tCyl.y;
            aZ = tCyl.z * 0.85;
        } else if (ratio < 0.68) {
            // Rectangular Life Support Backpack (Clear box on the back)
            aX = (Math.random() - 0.5) * 9.5;
            aY = 3.5 + (Math.random() - 0.5) * 13;
            aZ = -5.8 - Math.random() * 4.2;
        } else if (ratio < 0.82) {
            // Right Arm: Raised & Waving (Greeting!)
            const armT = Math.random();
            // Shoulder (x: 6.5, y: 9) -> Elbow (x: 13, y: 15) -> Waving Hand (x: 15, y: 22)
            let curX, curY, curZ;
            if (armT < 0.55) {
                // Upper arm
                const s = armT / 0.55;
                curX = 6.5 + s * 6.5;
                curY = 9 + s * 6.0;
                curZ = 0.5 + s * 2.0;
            } else {
                // Forearm & Hand waving
                const s = (armT - 0.55) / 0.45;
                curX = 13 + Math.sin(s * Math.PI) * 2.5;
                curY = 15 + s * 7.5;
                curZ = 2.5 + Math.cos(s * Math.PI * 2) * 1.5;
            }
            aX = curX + (Math.random() - 0.5) * 1.2;
            aY = curY + (Math.random() - 0.5) * 1.2;
            aZ = curZ + (Math.random() - 0.5) * 1.2;
        } else {
            // Left Arm & Floating Zero-G Legs
            const partIdx = i % 3;
            if (partIdx === 0) {
                // Left arm relaxed at side
                const aT = Math.random();
                aX = -6.5 - aT * 3.5 + (Math.random() - 0.5) * 1.0;
                aY = 9 - aT * 10 + (Math.random() - 0.5) * 1.0;
                aZ = 0.5 + aT * 1.5;
            } else if (partIdx === 1) {
                // Right Leg (gently bent backward in float)
                const lT = Math.random();
                aX = 3.2 + lT * 2.2 + (Math.random() - 0.5) * 1.0;
                aY = -2 - lT * 16 + (Math.random() - 0.5) * 1.0;
                aZ = lT * 4.5 + (Math.random() - 0.5) * 1.0;
            } else {
                // Left Leg (extended forward in float)
                const lT = Math.random();
                aX = -3.2 - lT * 2.8 + (Math.random() - 0.5) * 1.0;
                aY = -2 - lT * 17 + (Math.random() - 0.5) * 1.0;
                aZ = -lT * 3.5 + (Math.random() - 0.5) * 1.0;
            }
        }
        shapes[3].push(aX, aY, aZ);

        // =====================================================================
        // Dynamic Vertex Coloring (Gold Visor / Cyan Body / Electric Ice highlights)
        // =====================================================================
        const c3 = i * 3;
        let c;
        if (ratio < 0.20) {
            // Front visor / energy core is bright golden amber
            c = COLOR_GOLD.clone().lerp(COLOR_WHITE, Math.random() * 0.4);
        } else if (ratio < 0.60) {
            // Body / panels are electric cyan & white
            c = COLOR_CYAN.clone().lerp(COLOR_WHITE, Math.random() * 0.35);
        } else if (ratio < 0.85) {
            // Wings / thrusters / arms
            c = COLOR_ICE.clone().lerp(COLOR_AMBER, (i % 2 === 0) ? 0.6 : 0.1);
        } else {
            // Trails & stars
            c = COLOR_AMBER.clone().lerp(COLOR_GOLD, Math.random());
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
        size: 1.95,
        map: particleTexture,
        transparent: true,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
        depthWrite: false,
        opacity: 0.94
    });

    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);

    // -------------------------------------------------------------------------
    // Morphing Engine & Scroll Tracking with Matter Dissolution
    // -------------------------------------------------------------------------
    let currentShapeIndex = 0;
    let targetShapeIndex = 0;
    let morphFactor = 0; // 0 to 1 between current and target
    let dissolutionIntensity = 0; // Peaks at 0.5 of transition (matter vortex)

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

        // Cubic ease for smooth shape positioning
        const easeFraction = fraction * fraction * (3 - 2 * fraction);

        currentShapeIndex = currentIdx;
        targetShapeIndex = nextIdx;
        morphFactor = easeFraction;

        // Dissolution peaks halfway through the scroll (when fraction is ~0.5)
        // sin(fraction * PI) = 0 at start, 1.0 at midpoint, 0 at arrival!
        dissolutionIntensity = Math.sin(fraction * Math.PI);

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
    // Mouse Interaction & Magnetic Gravitational Field
    // -------------------------------------------------------------------------
    let mouseX = 0;
    let mouseY = 0;
    let targetRotX = 0;
    let targetRotY = 0;
    let mouse3D = new THREE.Vector3(0, 0, 0);

    window.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.clientY / window.innerHeight) * 2 + 1;

        targetRotY = mouseX * 0.40;
        targetRotX = -mouseY * 0.30;

        // Unproject mouse to 3D space for particle repulsion / attraction
        mouse3D.set(mouseX * 45, mouseY * 35, 10);
    });

    // -------------------------------------------------------------------------
    // Render Loop: Matter Formation, Cosmic Dissolution & Magnetic Flutter
    // -------------------------------------------------------------------------
    let clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        const delta = clock.getDelta();
        const time = clock.getElapsedTime();

        // Smooth camera / scene tilt from mouse parallax
        particleSystem.rotation.y += (targetRotY - particleSystem.rotation.y) * 0.05;
        particleSystem.rotation.x += (targetRotX - particleSystem.rotation.x) * 0.05;

        // Gentle cosmic idle breathing
        particleSystem.rotation.z = Math.sin(time * 0.4) * 0.05;

        // Starfield gentle rotation
        starField.rotation.y = time * 0.015;
        starField.rotation.x = time * 0.008;

        // Morph particles with dissolution swirl
        const positions = particleGeometry.attributes.position.array;
        const s1 = shapes[currentShapeIndex];
        const s2 = shapes[targetShapeIndex];

        // Swirl vortex angle during dissolution
        const swirlAngle = time * 2.5;
        const sinSwirl = Math.sin(swirlAngle);
        const cosSwirl = Math.cos(swirlAngle);

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const i3 = i * 3;

            // Base interpolated target position between the two shapes
            const x1 = s1[i3], y1 = s1[i3 + 1], z1 = s1[i3 + 2];
            const x2 = s2[i3], y2 = s2[i3 + 1], z2 = s2[i3 + 2];

            let tx = x1 + (x2 - x1) * morphFactor;
            let ty = y1 + (y2 - y1) * morphFactor;
            let tz = z1 + (z2 - z1) * morphFactor;

            // When scrolling, matter disassembles into swirling cosmic molecules!
            if (dissolutionIntensity > 0.01) {
                const dispX = particleDispersions[i3];
                const dispY = particleDispersions[i3 + 1];
                const dispZ = particleDispersions[i3 + 2];

                // Swirl rotational displacement around center
                const vortexX = dispX * cosSwirl - dispZ * sinSwirl;
                const vortexZ = dispX * sinSwirl + dispZ * cosSwirl;

                tx += vortexX * dissolutionIntensity;
                ty += (dispY + Math.sin(time * 4 + i * 0.05) * 15) * dissolutionIntensity;
                tz += vortexZ * dissolutionIntensity;
            }

            // Mouse magnetic ripple if close to particle
            const dx = positions[i3] - mouse3D.x;
            const dy = positions[i3 + 1] - mouse3D.y;
            const distSq = dx * dx + dy * dy;
            if (distSq < 250 && distSq > 1) {
                const force = (1 - distSq / 250) * 4.5;
                tx += (dx / Math.sqrt(distSq)) * force;
                ty += (dy / Math.sqrt(distSq)) * force;
            }

            // Micro Brownian vibration (alive matter effect)
            const microWave = Math.sin(time * 2.5 + i * 0.15) * 0.35;
            const microWaveCos = Math.cos(time * 2.1 + i * 0.18) * 0.35;

            // Responsive spring lerp
            positions[i3] += (tx + microWave - positions[i3]) * 0.09;
            positions[i3 + 1] += (ty + microWaveCos - positions[i3 + 1]) * 0.09;
            positions[i3 + 2] += (tz - positions[i3 + 2]) * 0.09;
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
        'tefi': {
            title: 'Tefi.app: Microcrédito Barrial en Solana',
            desc: `Tefi.app es un sistema pionero de microcrédito barrial ("fiado digital") descentralizado sobre la blockchain de Solana. Diseñado para comunidades y comercios de cercanía, digitaliza la confianza cotidiana sin intermediarios bancarios ni requerir que los vecinos posean criptomonedas.<br><br>
            <strong>💎 Arquitectura Técnica & Web3</strong><br>
            • <b>Co-Firma P2P Offline por QR:</b> Transacciones construidas por el almacén (fee payer) y co-firmadas de forma criptográfica por el celular del vecino escaneando un código QR dinámico ultracompacto.<br>
            • <b>Smart Contracts en Anchor / Rust:</b> Programa desplegado en Solana Devnet con libreta contable inmutable, límites de crédito dinámicos y scoring algorítmico on-chain.<br>
            • <b>Zero Cost para el Vecino:</b> El comercio financia el rent y los gas fees de cada transacción, democratizando el acceso a usuarios sin SOL ni conocimientos técnicos.<br>
            • <b>PWA Multiplataforma Bilingüe:</b> Experiencia 100% web instalable en iOS y Android, con soporte offline, escaneo nativo por hardware de cámara y modo demo.<br>
            • <b>Auditoría y Testing Robusto:</b> Suite automatizada con más de 100 pruebas unitarias y validaciones E2E en dos teléfonos simultáneos.`,
            icon: '⚡',
            images: [
                'assets/tefi_preview.png'
            ],
            link: 'https://tef-iapp.vercel.app/'
        },
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
