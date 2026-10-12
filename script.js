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
    scene.fog = new THREE.FogExp2(0x03050c, 0.012);

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
        gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.90)');
        gradient.addColorStop(0.5, 'rgba(140, 215, 255, 0.45)');
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
    const starCount = 1249; // +2% adicional de estrellas (1224 * 1.02 = 1249)
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
        size: 1.3,
        map: particleTexture,
        transparent: true,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
        depthWrite: false,
        opacity: 0.743 // +3% adicional de brillo (0.721 * 1.03 = 0.743)
    });

    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);

    // -------------------------------------------------------------------------
    // HD PARTICLE ENGINE v4: DEFINICIÓN ULTRA-NÍTIDA Y TRANSICIONES CENTRADAS
    // Figuras: 0 = Cohete, 1 = Satélite, 2 = Ojo Cibernético, 3 = Astronauta
    // -------------------------------------------------------------------------
    const isMobile = window.innerWidth < 768;
    const PARTICLE_COUNT = isMobile ? 6500 : 10000;
    const TAU = Math.PI * 2;

    const C = {
        white: new THREE.Color('#ffffff'),
        pureIce: new THREE.Color('#e0f2fe'),
        ice: new THREE.Color('#bae6fd'),
        cyan: new THREE.Color('#38bdf8'),
        deepCyan: new THREE.Color('#0284c7'),
        electricBlue: new THREE.Color('#2563eb'),
        gold: new THREE.Color('#fbbf24'),
        amber: new THREE.Color('#f59e0b'),
        orange: new THREE.Color('#f97316'),
        crimson: new THREE.Color('#ef4444'),
        lime: new THREE.Color('#22c55e')
    };

    // --- Vector & Geometry Helpers ---
    const rnd = (a, b) => a + Math.random() * (b - a);
    const lerp = (a, b, t) => a + (b - a) * t;
    function randDir() {
        const z = rnd(-1, 1), t = rnd(0, TAU), r = Math.sqrt(Math.max(0, 1 - z * z));
        return [r * Math.cos(t), r * Math.sin(t), z];
    }
    const lerp3 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
    const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
    const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
    const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
    const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    const len = a => Math.hypot(a[0], a[1], a[2]);
    const norm = a => mul(a, 1 / (len(a) || 1));
    function basis(axis) {
        const n = norm(axis);
        const ref = Math.abs(n[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
        const u = norm(cross(n, ref));
        return [n, u, cross(n, u)];
    }
    const jit = (p, j) => [p[0] + rnd(-j, j), p[1] + rnd(-j, j), p[2] + rnd(-j, j)];

    // --- High-Precision Primitive Samplers ---
    const P = {
        ellipsoid: (c, r) => () => { const d = randDir(); return [c[0] + d[0] * r[0], c[1] + d[1] * r[1], c[2] + d[2] * r[2]]; },
        tube: (a, b, ra, rb = ra) => {
            const [, u, v] = basis(sub(b, a));
            return () => {
                const t = Math.random(), ang = rnd(0, TAU), r = lerp(ra, rb, t);
                return add(lerp3(a, b, t), add(mul(u, Math.cos(ang) * r), mul(v, Math.sin(ang) * r)));
            };
        },
        ring: (c, axis, R, thick = 0.1) => {
            const [, u, v] = basis(axis);
            return () => {
                const ang = rnd(0, TAU), r = R + rnd(-thick, thick);
                return add(c, add(mul(u, Math.cos(ang) * r), mul(v, Math.sin(ang) * r)));
            };
        },
        disk: (c, axis, R) => {
            const [, u, v] = basis(axis);
            return () => {
                const ang = rnd(0, TAU), r = R * Math.sqrt(Math.random());
                return add(c, add(mul(u, Math.cos(ang) * r), mul(v, Math.sin(ang) * r)));
            };
        },
        rect: (c, w, h) => () => [c[0] + rnd(-w / 2, w / 2), c[1] + rnd(-h / 2, h / 2), c[2] + rnd(-0.06, 0.06)],
        segs: (list, j = 0.05) => {
            const lens = list.map(s => len(sub(s[1], s[0])));
            const total = lens.reduce((a, b) => a + b, 0);
            return () => {
                let r = Math.random() * total, k = 0;
                while (k < list.length - 1 && r > lens[k]) { r -= lens[k]; k++; }
                return jit(lerp3(list[k][0], list[k][1], Math.random()), j);
            };
        },
        box: (c, s) => {
            const [w, h, d] = s;
            const areas = [h * d, h * d, w * d, w * d, w * h, w * h];
            const total = areas.reduce((a, b) => a + b, 0);
            return () => {
                let r = Math.random() * total, f = 0;
                while (f < 5 && r > areas[f]) { r -= areas[f]; f++; }
                const p = [rnd(-w / 2, w / 2), rnd(-h / 2, h / 2), rnd(-d / 2, d / 2)];
                const axis = f >> 1, sign = (f & 1) ? -1 : 1;
                p[axis] = sign * s[axis] / 2;
                return add(c, p);
            };
        },
        boxEdges: (c, s, j = 0.04) => {
            const corners = [];
            for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) {
                corners.push([c[0] + sx * s[0] / 2, c[1] + sy * s[1] / 2, c[2] + sz * s[2] / 2]);
            }
            const edges = [];
            for (let i = 0; i < 8; i++) for (let k = i + 1; k < 8; k++) {
                const same = [0, 1, 2].filter(a => corners[i][a] === corners[k][a]).length;
                if (same === 2) edges.push([corners[i], corners[k]]);
            }
            return P.segs(edges, j);
        },
        lathe: (profile, rMax) => () => {
            let y, r, guard = 0;
            do { [y, r] = profile(Math.random()); guard++; } while (Math.random() * rMax > r && guard < 40);
            const ang = rnd(0, TAU);
            return [Math.cos(ang) * r, y, Math.sin(ang) * r];
        },
        tris: (list, j = 0.1) => {
            const areas = list.map(([a, b, c]) => len(cross(sub(b, a), sub(c, a))) / 2);
            const total = areas.reduce((x, y) => x + y, 0);
            return () => {
                let r = Math.random() * total, k = 0;
                while (k < list.length - 1 && r > areas[k]) { r -= areas[k]; k++; }
                let u = Math.random(), v = Math.random();
                if (u + v > 1) { u = 1 - u; v = 1 - v; }
                const [a, b, c] = list[k];
                return jit(add(a, add(mul(sub(b, a), u), mul(sub(c, a), v))), j);
            };
        },
        curve: (fn, j = 0.05, dash = 0) => () => {
            let t;
            do { t = Math.random(); } while (dash && ((t * dash) % 1) > 0.55);
            return jit(fn(t), j);
        }
    };

    const rotZ = a => p => [p[0] * Math.cos(a) - p[1] * Math.sin(a), p[0] * Math.sin(a) + p[1] * Math.cos(a), p[2]];
    const rotX = a => p => [p[0], p[1] * Math.cos(a) - p[2] * Math.sin(a), p[1] * Math.sin(a) + p[2] * Math.cos(a)];
    const rotY = a => p => [p[0] * Math.cos(a) + p[2] * Math.sin(a), p[1], -p[0] * Math.sin(a) + p[2] * Math.cos(a)];
    const compose = (...fs) => p => fs.reduce((q, f) => f(q), p);

    function buildShape(parts, { size, transform = null, pivot = null }) {
        const pos = new Float32Array(PARTICLE_COUNT * 3);
        const col = new Float32Array(PARTICLE_COUNT * 3);
        const agit = new Float32Array(PARTICLE_COUNT);
        const tag = new Uint8Array(PARTICLE_COUNT);

        const total = parts.reduce((s, p) => s + p.w, 0);
        const order = [];
        let acc = 0;
        parts.forEach((p, k) => {
            acc += p.w;
            const end = Math.round(acc / total * PARTICLE_COUNT);
            while (order.length < end) order.push(k);
        });
        while (order.length < PARTICLE_COUNT) order.push(parts.length - 1);
        for (let i = order.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [order[i], order[j]] = [order[j], order[i]];
        }

        const tmp = new THREE.Color();
        const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const part = parts[order[i]];
            let p = part.fn();
            if (transform) p = transform(p);
            for (let a = 0; a < 3; a++) { min[a] = Math.min(min[a], p[a]); max[a] = Math.max(max[a], p[a]); }
            pos[i * 3] = p[0]; pos[i * 3 + 1] = p[1]; pos[i * 3 + 2] = p[2];
            tmp.copy(part.c);
            if (part.c2) tmp.lerp(part.c2, Math.random());
            const b = (part.b || 1) * rnd(0.9, 1.15);
            col[i * 3] = tmp.r * b; col[i * 3 + 1] = tmp.g * b; col[i * 3 + 2] = tmp.b * b;
            agit[i] = part.agit || 0;
            tag[i] = part.tag || 0;
        }

        const center = [(min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2];
        const factor = size / Math.max(max[0] - min[0], max[1] - min[1]);
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            for (let a = 0; a < 3; a++) pos[i * 3 + a] = (pos[i * 3 + a] - center[a]) * factor;
        }
        let pv = null;
        if (pivot) {
            const tp = transform ? transform(pivot) : pivot;
            pv = [(tp[0] - center[0]) * factor, (tp[1] - center[1]) * factor, (tp[2] - center[2]) * factor];
        }
        return {
            pos, col, agit, tag, pivot: pv,
            w: (max[0] - min[0]) * factor,
            h: (max[1] - min[1]) * factor,
            layout: { x: 0, y: 0, z: 0, scale: 1, op: 1 }
        };
    }

    // =========================================================================
    // SHAPE 0: COHETE (Rocket Launch)
    // =========================================================================
    function makeRocket() {
        const rocketR = y => {
            if (y < 6) return 5.4 - Math.max(0, -10 - y) * 0.08;
            const k = (y - 6) / 16;
            return 5.4 * Math.pow(Math.max(0, 1 - k * k), 0.55);
        };
        const parts = [
            { w: 28, fn: P.lathe(t => { const y = -15 + t * 29; return [y, rocketR(y)]; }, 5.5), c: C.white, c2: C.pureIce },
            { w: 9, fn: P.lathe(t => { const y = 14 + t * 8; return [y, rocketR(y)]; }, 5.5), c: C.gold, c2: C.amber, b: 1.2 },
            { w: 2.5, fn: P.ring([0, 14, 0], [0, 1, 0], rocketR(14) + 0.15), c: C.amber, b: 1.35 },
            { w: 2.5, fn: P.ring([0, -8, 0], [0, 1, 0], 5.55), c: C.amber, b: 1.35 },
            { w: 3.0, fn: P.ring([0, 5, 5.5], [0, 0, 1], 2.4, 0.12), c: C.white, b: 1.4 },
            { w: 2.5, fn: P.disk([0, 5, 5.55], [0, 0, 1], 2.0), c: C.cyan, c2: C.deepCyan },
            { w: 5, fn: P.lathe(t => [-19 + t * 4, 4.4 - 1.3 * t], 4.5), c: C.ice, c2: C.cyan, b: 0.95 }
        ];
        // 4 aletas
        [0, Math.PI / 2, Math.PI, Math.PI * 1.5].forEach(th => {
            const to3 = (r, y) => [Math.cos(th) * r, y, Math.sin(th) * r];
            const A = to3(5.2, -3), B = to3(5.2, -15), Cc = to3(11.5, -19.5), D = to3(11.5, -14);
            parts.push({ w: 3.5, fn: P.tris([[A, B, D], [B, Cc, D]], 0.1), c: C.ice, c2: C.cyan, b: 0.9 });
            parts.push({ w: 2.0, fn: P.segs([[A, D], [D, Cc], [Cc, B]]), c: C.white, b: 1.4 });
        });
        // Llama hiper-vibrante
        parts.push({
            w: 8, agit: 0.35, c: C.white, c2: C.gold, b: 1.3,
            fn: () => {
                const t = Math.pow(Math.random(), 1.3), y = -19.5 - t * 9;
                const r = 2.6 * (1 - t) * Math.sqrt(Math.random()), a = rnd(0, TAU);
                return [Math.cos(a) * r, y, Math.sin(a) * r];
            }
        });
        parts.push({
            w: 12, agit: 0.6, c: C.gold, c2: C.orange, b: 1.15,
            fn: () => {
                const t = Math.random(), y = -19.5 - t * 18;
                const R = 4.4 * (1 - t) * (0.75 + 0.6 * Math.sin(Math.PI * t * 0.9));
                const r = R * (0.65 + 0.35 * Math.random()), a = rnd(0, TAU);
                return [Math.cos(a) * r, y, Math.sin(a) * r];
            }
        });
        parts.push({
            w: 3.0, agit: 1.2, c: C.amber, c2: C.orange, b: 1.0,
            fn: () => {
                const t = Math.random(), y = -34 - t * 11, r = 1 + t * 4 * Math.random(), a = rnd(0, TAU);
                return [Math.cos(a) * r, y, Math.sin(a) * r];
            }
        });
        return buildShape(parts, { size: 52, transform: compose(rotZ(-0.55), rotX(0.15)) });
    }

    // =========================================================================
    // SHAPE 1: SATÉLITE (Satellite Orbiter HD) - Ángulo frontal nítido
    // =========================================================================
    function makeSatellite() {
        const parts = [];

        // 1. Chasis Central (Cuerpo cúbico estructural en oro y blanco)
        // Aristas nítidas del cuerpo principal
        parts.push({ w: 8, fn: P.boxEdges([0, 0, 0], [10, 13, 9]), c: C.white, c2: C.pureIce, b: 1.5 });
        // Fajas estructurales horizontales alrededor del cuerpo
        parts.push({ w: 3, fn: P.boxEdges([0, -3.5, 0], [10.2, 0.4, 9.2]), c: C.gold, b: 1.4 });
        parts.push({ w: 3, fn: P.boxEdges([0, 3.5, 0], [10.2, 0.4, 9.2]), c: C.gold, b: 1.4 });
        // Manto térmico dorado con leve brillo superficial (reducido para no saturar)
        parts.push({ w: 4, fn: P.box([0, 0, 0], [9.6, 12.6, 8.6]), c: C.gold, c2: C.amber, b: 0.95 });

        // 2. Bahía de Sensores y Lente Óptico Frontal
        parts.push({ w: 3.5, fn: P.ring([0, 0, 4.6], [0, 0, 1], 3.2, 0.08), c: C.white, b: 1.55 });
        parts.push({ w: 2.5, fn: P.ring([0, 0, 4.6], [0, 0, 1], 2.0, 0.06), c: C.cyan, b: 1.45 });
        parts.push({ w: 1.5, fn: P.disk([0, 0, 4.6], [0, 0, 1], 1.2), c: C.pureIce, b: 1.6 });

        // 3. Toberas de Propulsión RCS en las 4 esquinas inferiores
        for (const sx of [-1, 1]) {
            for (const sz of [-1, 1]) {
                const bPos = [sx * 4.6, -6.6, sz * 4.2];
                parts.push({ w: 0.8, fn: P.ring(bPos, [0, -1, 0], 1.1, 0.06), c: C.amber, b: 1.4 });
            }
        }

        // 4. Paneles Solares Gigantes (Solar Array Wings)
        [-1, 1].forEach(s => {
            const x0 = s * 7.5, x1 = s * 34, hh = 6.2;

            // Brazos de celosía / pivote de soporte hacia el satélite
            parts.push({
                w: 2.2, c: C.white, b: 1.4,
                fn: P.segs([
                    [[s * 5.0, 0, 0], [s * 7.5, 0, 0]],
                    [[s * 5.0, 2.5, 0], [s * 7.5, 0, 0]],
                    [[s * 5.0, -2.5, 0], [s * 7.5, 0, 0]]
                ], 0.03)
            });

            // Marco perimetral ultra-nítido del ala solar
            parts.push({
                w: 8.5, c: C.white, c2: C.pureIce, b: 1.5,
                fn: P.segs([
                    [[x0, -hh, 0], [x1, -hh, 0]],
                    [[x1, -hh, 0], [x1, hh, 0]],
                    [[x1, hh, 0], [x0, hh, 0]],
                    [[x0, hh, 0], [x0, -hh, 0]]
                ], 0.03)
            });

            // Grilla ortogonal de celdas fotovoltaicas (líneas divisorias nítidas)
            const grid = [];
            for (let k = 1; k <= 7; k++) {
                const x = lerp(x0, x1, k / 8);
                grid.push([[x, -hh, 0], [x, hh, 0]]);
            }
            [-hh * 0.5, 0, hh * 0.5].forEach(y => {
                grid.push([[x0, y, 0], [x1, y, 0]]);
            });
            parts.push({ w: 10, fn: P.segs(grid, 0.03), c: C.cyan, c2: C.pureIce, b: 1.4 });

            // Células de silicio activas (resplandor azul eléctrico sutil en celdas)
            parts.push({
                w: 6, c: C.electricBlue, c2: C.deepCyan, b: 0.9,
                fn: () => {
                    const col = Math.floor(Math.random() * 8);
                    const row = Math.floor(Math.random() * 4);
                    const xa = lerp(x0, x1, col / 8) + rnd(0.4, (x1 - x0) / 8 - 0.4);
                    const ya = -hh + (row + 0.5) * (hh * 2 / 4) + rnd(-0.6, 0.6);
                    return [xa, ya, rnd(-0.04, 0.04)];
                }
            });
        });

        // 5. Gran Antena Parabólica de Comunicaciones (High-Gain Dish Antenna)
        const dc = [0, 14.2, 1.2], dn = norm([0, 0.72, 0.68]);
        const [n, u, v] = basis(dn);

        // Mástil de anclaje de la antena
        parts.push({ w: 1.8, fn: P.segs([[[0, 6.5, 0], dc]], 0.03), c: C.white, b: 1.4 });

        // Aro exterior nítido de la parábola
        parts.push({ w: 6.5, fn: P.ring(add(dc, mul(n, 8.4 * 8.4 / 18)), dn, 8.4, 0.08), c: C.white, c2: C.pureIce, b: 1.6 });
        // Aro interior concéntrico
        parts.push({ w: 4.0, fn: P.ring(add(dc, mul(n, 4.5 * 4.5 / 18)), dn, 4.5, 0.08), c: C.pureIce, b: 1.4 });
        // Centro / buje
        parts.push({ w: 2.0, fn: P.ring(dc, dn, 1.5, 0.06), c: C.cyan, b: 1.4 });

        // 8 Radios estructurales de la parábola (nervaduras parabólicas en alambre)
        const ribs = [];
        for (let i = 0; i < 8; i++) {
            const ang = i * TAU / 8;
            const ca = Math.cos(ang), sa = Math.sin(ang);
            for (let s = 0; s < 6; s++) {
                const rA = lerp(1.5, 8.4, s / 6), rB = lerp(1.5, 8.4, (s + 1) / 6);
                const hA = rA * rA / 18, hB = rB * rB / 18;
                const pA = add(dc, add(add(mul(u, ca * rA), mul(v, sa * rA)), mul(n, hA)));
                const pB = add(dc, add(add(mul(u, ca * rB), mul(v, sa * rB)), mul(n, hB)));
                ribs.push([pA, pB]);
            }
        }
        parts.push({ w: 6.0, fn: P.segs(ribs, 0.03), c: C.pureIce, c2: C.cyan, b: 1.35 });

        // Trípode del alimentador focal y subreflector dorado
        const focalPt = add(dc, mul(n, 5.8));
        const tripod = [0, 1, 2].map(k => {
            const ang = k * TAU / 3 + 0.5;
            const pt = add(dc, add(add(mul(u, Math.cos(ang) * 6.0), mul(v, Math.sin(ang) * 6.0)), mul(n, 2.0)));
            return [pt, focalPt];
        });
        parts.push({ w: 2.2, fn: P.segs(tripod, 0.03), c: C.white, b: 1.45 });
        parts.push({ w: 1.2, fn: P.ring(focalPt, dn, 0.9, 0.05), c: C.gold, b: 1.6 });

        // 6. Mástil de Instrumentación / Magnetómetro Desplegado (Hacia abajo)
        const mastSegs = [
            [[0, -6.5, 0], [0, -18.5, 0]],
            [[0, -10.0, -1.0], [0, -10.0, 1.0]],
            [[0, -14.0, -1.0], [0, -14.0, 1.0]]
        ];
        parts.push({ w: 2.0, fn: P.segs(mastSegs, 0.03), c: C.white, b: 1.35 });
        parts.push({ w: 1.0, fn: P.ring([0, -18.5, 0], [0, 1, 0], 1.0, 0.05), c: C.gold, b: 1.6 });

        return buildShape(parts, { size: 58, transform: compose(rotZ(-0.12), rotY(-0.28), rotX(0.20)) });
    }

    // =========================================================================
    // SHAPE 2: OJO CIBERNÉTICO & RETÍCULA NEURAL HD (Cyber AI Vision HUD)
    // =========================================================================
    function makeEye() {
        const W = 34, H = 15.0;
        const circle = (R, z) => t => [Math.cos(t * TAU) * R, Math.sin(t * TAU) * R, z];
        const parts = [];

        // 1. Párpados Almendrados Principales (Curvas dobles estilizadas con amplio espacio negativo)
        // Párpado superior primario (blanco puro brillante)
        parts.push({
            w: 9.0, c: C.white, c2: C.pureIce, b: 1.6,
            fn: P.curve(t => { const x = -W + 2 * W * t; return [x, H * (1 - (x / W) ** 2), 0.6]; }, 0.02)
        });
        // Párpado superior secundario (arco orbital cian)
        parts.push({
            w: 5.5, c: C.cyan, b: 1.35,
            fn: P.curve(t => { const x = -W * 0.88 + 1.76 * W * t; return [x, (H + 3.2) * (1 - (x / (W * 0.88)) ** 2), 0.3]; }, 0.02)
        });
        // Párpado inferior primario (blanco puro)
        parts.push({
            w: 8.5, c: C.white, c2: C.pureIce, b: 1.6,
            fn: P.curve(t => { const x = -W + 2 * W * t; return [x, -H * 0.82 * (1 - (x / W) ** 2), 0.6]; }, 0.02)
        });
        // Párpado inferior secundario (cian)
        parts.push({
            w: 5.0, c: C.cyan, b: 1.35,
            fn: P.curve(t => { const x = -W * 0.88 + 1.76 * W * t; return [x, -(H + 2.6) * 0.82 * (1 - (x / (W * 0.88)) ** 2), 0.3]; }, 0.02)
        });
        // Ticks angulares en los vértices del ojo
        parts.push({
            w: 2.2, c: C.white, b: 1.5,
            fn: P.segs([[[-W - 2.0, 0, 0.4], [-W, 0, 0.4]], [[W, 0, 0.4], [W + 2.0, 0, 0.4]]], 0.02)
        });

        // 2. Iris Holográfico de Triple Anillo Concéntrico (Diámetro equilibrado)
        // Anillo exterior del iris (cian brillante)
        parts.push({ w: 8.5, fn: P.curve(circle(7.6, 0.5), 0.02), c: C.cyan, c2: C.pureIce, b: 1.6 });
        // Anillo medio del iris (azul eléctrico profundo)
        parts.push({ w: 6.0, fn: P.curve(circle(5.6, 0.55), 0.02), c: C.electricBlue, c2: C.cyan, b: 1.45 });
        // Anillo interior del iris (dorado tecnológico)
        parts.push({ w: 5.5, fn: P.curve(circle(3.8, 0.6), 0.02), c: C.gold, c2: C.amber, b: 1.55 });

        // 8 Aspas geométricas de apertura óptica de alta precisión
        const blades = [];
        for (let i = 0; i < 8; i++) {
            const a1 = i * TAU / 8, a2 = (i + 0.35) * TAU / 8;
            const p1 = [Math.cos(a1) * 3.8, Math.sin(a1) * 3.8, 0.55];
            const p2 = [Math.cos(a2) * 7.6, Math.sin(a2) * 7.6, 0.5];
            blades.push([p1, p2]);
        }
        parts.push({ w: 5.5, fn: P.segs(blades, 0.02), c: C.pureIce, c2: C.cyan, b: 1.35 });

        // 3. Pupila y Foco Cuántico Central
        parts.push({ w: 4.0, fn: P.curve(circle(2.2, 0.65), 0.02), c: C.white, b: 1.7 });
        parts.push({ w: 2.0, fn: P.ring([0, 0, 0.7], [0, 0, 1], 0.9, 0.03), c: C.gold, b: 1.8 });
        // Destello especular de lente
        parts.push({ w: 1.5, fn: P.segs([[[-1.4, 1.4, 0.75], [-0.5, 2.3, 0.75]]], 0.02), c: C.white, b: 1.8 });

        // 4. Mirilla Táctica HUD y Retícula de Escaneo
        // 4 Esquinas L de Bounding Box [   ] bien separadas del ojo
        const bx = 36, by = 18, blen = 8.0;
        const boxCorners = [
            [[bx - blen, by, 0.2], [bx, by, 0.2]], [[bx, by, 0.2], [bx, by - blen, 0.2]],
            [[-bx + blen, by, 0.2], [-bx, by, 0.2]], [[-bx, by, 0.2], [-bx, by - blen, 0.2]],
            [[bx - blen, -by, 0.2], [bx, -by, 0.2]], [[bx, -by, 0.2], [bx, -by + blen, 0.2]],
            [[-bx + blen, -by, 0.2], [-bx, -by, 0.2]], [[-bx, -by, 0.2], [-bx, -by + blen, 0.2]]
        ];
        parts.push({ w: 8.0, fn: P.segs(boxCorners, 0.02), c: C.cyan, c2: C.pureIce, b: 1.6 });

        // Mirilla en Cruz (+ Precision Crosshair ticks) exteriores al iris
        const crossTicks = [
            [[0, 9.5, 0.2], [0, 15.0, 0.2]],
            [[0, -9.5, 0.2], [0, -15.0, 0.2]],
            [[10.5, 0, 0.2], [17.5, 0, 0.2]],
            [[-10.5, 0, 0.2], [-17.5, 0, 0.2]]
        ];
        parts.push({ w: 4.5, fn: P.segs(crossTicks, 0.02), c: C.gold, b: 1.5 });

        // Arcos de Medición HUD en grados (Dashed peripheral telemetry)
        parts.push({
            w: 4.5, c: C.gold, c2: C.amber, b: 1.35,
            fn: P.curve(t => {
                const a = t < 0.5 ? lerp(-0.6, 0.6, t * 2) : lerp(Math.PI - 0.6, Math.PI + 0.6, (t - 0.5) * 2);
                return [Math.cos(a) * 14.5, Math.sin(a) * 14.5, 0.1];
            }, 0.02, 24)
        });

        // Línea de Escaneo Láser Horizontal con Marcadores de Tracking
        parts.push({
            w: 4.0, c: C.cyan, b: 1.3,
            fn: P.segs([
                [[-33, 0, 0.35], [33, 0, 0.35]],
                [[-16, -1.4, 0.35], [-16, 1.4, 0.35]],
                [[16, -1.4, 0.35], [16, 1.4, 0.35]]
            ], 0.02)
        });

        // 5. Trazas de Circuitos Neuronales (Neural PCB Traces laterales)
        const circuitTraces = [
            [[-W, 0, 0.2], [-W - 5, 0, 0.2]],
            [[-W - 5, 0, 0.2], [-W - 10, 6, 0.2]],
            [[-W - 10, 6, 0.2], [-W - 17, 6, 0.2]],
            [[-W - 5, 0, 0.2], [-W - 9, -6, 0.2]],
            [[-W - 9, -6, 0.2], [-W - 15, -6, 0.2]],
            [[W, 0, 0.2], [W + 5, 0, 0.2]],
            [[W + 5, 0, 0.2], [W + 10, 6, 0.2]],
            [[W + 10, 6, 0.2], [W + 17, 6, 0.2]],
            [[W + 5, 0, 0.2], [W + 9, -6, 0.2]],
            [[W + 9, -6, 0.2], [W + 15, -6, 0.2]]
        ];
        parts.push({ w: 4.5, fn: P.segs(circuitTraces, 0.02), c: C.cyan, c2: C.pureIce, b: 1.4 });
        [[-W - 17, 6], [-W - 15, -6], [W + 17, 6], [W + 15, -6]].forEach(pt => {
            parts.push({ w: 0.6, fn: P.ring([pt[0], pt[1], 0.2], [0, 0, 1], 0.9, 0.03), c: C.gold, b: 1.6 });
        });

        return buildShape(parts, { size: 58, transform: compose(rotY(-0.04), rotX(0.02)) });
    }

    // =========================================================================
    // SHAPE 3: ASTRONAUTA HD (Spaceman Greeting)
    // =========================================================================
    function makeAstronaut() {
        const parts = [];
        const HC = [0, 15.0, 0], HR = 6.8;
        const elbowR = [11.0, 11.0, 1.5];

        // 1. Casco Espacial Holográfico (Estructura de domo en aros de alambre nítidos)
        // Aros de latitud horizontal del casco
        [11.5, 14.0, 16.5, 19.2].forEach(y => {
            const dy = y - HC[1];
            const r = Math.sqrt(Math.max(0.1, HR * HR - dy * dy));
            parts.push({ w: 2.2, fn: P.ring([0, y, 0], [0, 1, 0], r, 0.06), c: C.white, c2: C.pureIce, b: 1.3 });
        });
        // Aros de meridiano vertical del casco (perfil frontal y lateral)
        parts.push({
            w: 2.5, c: C.white, b: 1.3,
            fn: P.curve(t => {
                const a = t * Math.PI;
                return [0, HC[1] + Math.sin(a) * HR, -Math.cos(a) * HR];
            }, 0.04)
        });
        parts.push({
            w: 2.5, c: C.white, b: 1.3,
            fn: P.curve(t => {
                const a = t * Math.PI;
                return [-Math.cos(a) * HR, HC[1] + Math.sin(a) * HR, 0];
            }, 0.04)
        });

        // 2. Visor Dorado Frontal Apolo (El elemento más distintivo e icónico)
        // Borde exterior denso y brillante del visor
        const visorRim = (scale = 1.0, zOff = 0) => t => {
            const a = t * TAU;
            const rx = 4.8 * scale, ry = 3.6 * scale;
            return [rx * Math.cos(a), HC[1] + ry * Math.sin(a), 3.2 + (scale * 2.2) * Math.cos(a * 0.5) + zOff];
        };
        parts.push({ w: 7.0, fn: P.curve(visorRim(1.0, 0), 0.04), c: C.gold, c2: C.amber, b: 1.7 });
        parts.push({ w: 4.5, fn: P.curve(visorRim(0.85, 0.1), 0.04), c: C.gold, b: 1.5 });
        parts.push({ w: 3.5, fn: P.curve(visorRim(0.65, 0.2), 0.04), c: C.amber, b: 1.4 });
        parts.push({ w: 2.5, fn: P.curve(visorRim(0.40, 0.25), 0.04), c: C.gold, b: 1.4 });
        // Destello especular de reflejo de cristal cósmico en el visor
        parts.push({
            w: 2.0, c: C.white, b: 1.8,
            fn: P.segs([[[-2.8, 16.5, 5.0], [-1.0, 17.8, 4.8]], [[-1.2, 16.0, 5.2], [-0.2, 17.0, 5.0]]], 0.03)
        });

        // 3. Cápsulas de Comunicación en Orejas (Comm Pods) y Antena
        [-1, 1].forEach(s => {
            parts.push({ w: 1.5, fn: P.ring([s * 6.8, 15.0, 0], [1, 0, 0], 2.0, 0.05), c: C.pureIce, b: 1.4 });
            parts.push({ w: 1.0, fn: P.disk([s * 6.8, 15.0, 0], [1, 0, 0], 1.4), c: C.cyan, b: 1.3 });
        });
        // Antena de telemetría en cápsula izquierda
        parts.push({ w: 1.5, fn: P.segs([[[-6.8, 16.5, 0], [-8.0, 23.0, 0]]], 0.03), c: C.white, b: 1.4 });
        parts.push({ w: 0.8, fn: P.ring([-8.0, 23.0, 0], [0, 1, 0], 0.8, 0.04), c: C.gold, b: 1.7 });

        // 4. Cuello y Anillo de Presión (Neck Seal)
        parts.push({ w: 3.0, fn: P.ring([0, 8.8, 0], [0, 1, 0], 4.6, 0.06), c: C.white, b: 1.5 });
        parts.push({ w: 2.0, fn: P.ring([0, 8.3, 0], [0, 1, 0], 4.8, 0.06), c: C.cyan, b: 1.4 });

        // 5. Torso: Silueta con Costillas y Placas de Presión (NO volumen ciego)
        // Aros de contorno del traje en el torso
        [6.5, 3.8, 1.2, -1.4].forEach((y, idx) => {
            const rx = 6.0 - idx * 0.2, rz = 4.8 - idx * 0.15;
            parts.push({
                w: 2.5, c: C.white, c2: C.pureIce, b: 1.3,
                fn: P.curve(t => [rx * Math.cos(t * TAU), y, rz * Math.sin(t * TAU)], 0.04)
            });
        });
        // Costuras laterales del torso
        [-1, 1].forEach(s => {
            parts.push({
                w: 2.0, c: C.white, b: 1.3,
                fn: P.segs([[[s * 5.8, 7.5, 0], [s * 5.2, -4.0, 0]]], 0.04)
            });
        });

        // 6. Cinturón de Herramientas y Hebilla Dorada
        parts.push({ w: 3.0, fn: P.ring([0, -4.2, 0], [0, 1, 0], 5.2, 0.06), c: C.gold, b: 1.4 });
        parts.push({ w: 1.5, fn: P.boxEdges([0, -4.2, 5.2], [2.8, 1.8, 0.6]), c: C.gold, b: 1.6 });

        // 7. Panel de Control del Pecho (Chest Pack) con LEDs
        parts.push({ w: 4.0, fn: P.boxEdges([0, 2.6, 4.8], [5.2, 3.8, 1.2]), c: C.cyan, b: 1.55 });
        // LEDs indicadores del soporte vital
        parts.push({ w: 0.8, fn: P.ring([-1.5, 2.8, 5.5], [0, 0, 1], 0.45, 0.03), c: C.crimson, b: 1.8 });
        parts.push({ w: 0.8, fn: P.ring([0, 2.8, 5.5], [0, 0, 1], 0.45, 0.03), c: C.lime, b: 1.8 });
        parts.push({ w: 0.8, fn: P.ring([1.5, 2.8, 5.5], [0, 0, 1], 0.45, 0.03), c: C.cyan, b: 1.8 });

        // 8. Mochila de Soporte Vital PLSS (Primary Life Support System)
        parts.push({ w: 6.0, fn: P.boxEdges([0, 3.0, -5.6], [9.4, 12.5, 3.8]), c: C.white, c2: C.pureIce, b: 1.45 });
        // Cilindros dobles de oxígeno en la mochila
        [-1, 1].forEach(s => {
            parts.push({ w: 1.8, fn: P.tube([s * 3.0, 8.5, -5.6], [s * 3.0, -1.5, -5.6], 1.2), c: C.pureIce, b: 1.2 });
            parts.push({ w: 0.8, fn: P.ring([s * 3.0, 9.2, -5.6], [0, 1, 0], 1.2, 0.04), c: C.amber, b: 1.5 });
        });

        // 9. Brazo Derecho en Alto Saludando (Tag 1 para animación de onda de saludo)
        // Hombro derecho
        parts.push({ w: 1.5, fn: P.ring([5.8, 6.8, 0], [1, 0.3, 0], 2.6, 0.06), c: C.white, b: 1.35 });
        // Brazo superior (bíceps)
        parts.push({ w: 4.5, fn: P.tube([5.8, 6.8, 0], elbowR, 2.3), c: C.white, c2: C.pureIce, b: 1.3 });
        // Articulación del codo corrugada
        parts.push({ w: 1.8, fn: P.ring(elbowR, [0.3, 1, 0.2], 2.4, 0.06), c: C.gold, b: 1.45 });

        // Antebrazo animado (Tag 1)
        const wristR = [13.8, 18.5, 2.2];
        parts.push({ w: 4.5, tag: 1, fn: P.tube(elbowR, wristR, 2.1), c: C.white, c2: C.pureIce, b: 1.35 });
        // Muñeca y puño corrugado (Tag 1)
        parts.push({ w: 2.0, tag: 1, fn: P.ring(wristR, [0.2, 1, 0.1], 2.2, 0.06), c: C.gold, b: 1.5 });
        // Mano y Guante Abierto Saludando (Tag 1: Palma + 5 dedos individuales nítidos)
        parts.push({ w: 2.5, tag: 1, fn: P.ring([14.5, 20.2, 2.5], [0.2, 1, 0.1], 1.8, 0.06), c: C.white, b: 1.4 });
        const fingerRays = [
            [[13.2, 19.8, 3.0], [11.8, 20.8, 3.4]], // Pulgar abierto
            [[13.8, 20.8, 2.7], [13.8, 23.8, 2.8]], // Índice
            [[14.6, 21.0, 2.6], [14.8, 24.5, 2.7]], // Mayor
            [[15.4, 20.8, 2.5], [15.7, 23.8, 2.6]], // Anular
            [[16.1, 20.3, 2.4], [16.6, 22.8, 2.5]]  // Meñique
        ];
        parts.push({ w: 3.5, tag: 1, fn: P.segs(fingerRays, 0.03), c: C.white, c2: C.pureIce, b: 1.5 });

        // 10. Brazo Izquierdo Flotando Relajado
        const elbowL = [-11.5, 1.8, 1.2], wristL = [-13.8, -4.5, 2.2];
        parts.push({ w: 1.5, fn: P.ring([-5.8, 6.8, 0], [-1, 0.3, 0], 2.6, 0.06), c: C.white, b: 1.35 });
        parts.push({ w: 4.5, fn: P.tube([-5.8, 6.8, 0], elbowL, 2.3), c: C.white, c2: C.pureIce, b: 1.3 });
        parts.push({ w: 1.8, fn: P.ring(elbowL, [-0.3, -1, 0.2], 2.4, 0.06), c: C.gold, b: 1.45 });
        parts.push({ w: 4.0, fn: P.tube(elbowL, wristL, 2.1), c: C.white, c2: C.pureIce, b: 1.3 });
        parts.push({ w: 1.8, fn: P.ring(wristL, [-0.2, -1, 0.1], 2.2, 0.06), c: C.gold, b: 1.45 });
        parts.push({ w: 2.0, fn: P.ellipsoid([-14.2, -6.2, 2.5], [1.5, 1.8, 1.2]), c: C.white, b: 1.35 });

        // 11. Piernas en Gravedad Cero Abiertas (Wide Zero-G Stance - Espacio Negativo Limpio)
        const kneeR = [8.8, -13.5, 1.8], ankleR = [11.8, -22.5, 0.5];
        const kneeL = [-8.8, -13.0, -1.2], ankleL = [-12.2, -22.0, 0.8];

        // Anillos de articulación de cadera
        parts.push({ w: 1.8, fn: P.ring([3.8, -4.8, 0], [0.4, -1, 0.2], 2.9, 0.06), c: C.white, b: 1.35 });
        parts.push({ w: 1.8, fn: P.ring([-3.8, -4.8, 0], [-0.4, -1, -0.2], 2.9, 0.06), c: C.white, b: 1.35 });

        // Pierna Derecha: Muslo -> Rodilla corrugada -> Pantorrilla -> Tobillo -> Bota
        parts.push({ w: 5.5, fn: P.tube([3.8, -4.8, 0], kneeR, 2.7), c: C.white, c2: C.pureIce, b: 1.3 });
        parts.push({ w: 2.0, fn: P.ring(kneeR, [0.3, -1, 0.2], 2.8, 0.06), c: C.gold, b: 1.45 });
        parts.push({ w: 5.0, fn: P.tube(kneeR, ankleR, 2.4), c: C.white, c2: C.pureIce, b: 1.3 });
        parts.push({ w: 2.0, fn: P.ring(ankleR, [0.2, -1, 0.1], 2.5, 0.06), c: C.gold, b: 1.5 });
        // Suela de bota lunar rectangular con banda de tracción
        parts.push({ w: 3.5, fn: P.boxEdges([12.2, -24.5, 2.0], [3.4, 1.5, 6.2]), c: C.white, c2: C.pureIce, b: 1.5 });

        // Pierna Izquierda: Muslo -> Rodilla corrugada -> Pantorrilla -> Tobillo -> Bota
        parts.push({ w: 5.5, fn: P.tube([-3.8, -4.8, 0], kneeL, 2.7), c: C.white, c2: C.pureIce, b: 1.3 });
        parts.push({ w: 2.0, fn: P.ring(kneeL, [-0.3, -1, -0.2], 2.8, 0.06), c: C.gold, b: 1.45 });
        parts.push({ w: 5.0, fn: P.tube(kneeL, ankleL, 2.4), c: C.white, c2: C.pureIce, b: 1.3 });
        parts.push({ w: 2.0, fn: P.ring(ankleL, [-0.2, -1, 0.1], 2.5, 0.06), c: C.gold, b: 1.5 });
        // Suela de bota lunar rectangular izquierda
        parts.push({ w: 3.5, fn: P.boxEdges([-12.6, -24.0, 2.4], [3.4, 1.5, 6.2]), c: C.white, c2: C.pureIce, b: 1.5 });

        // 12. Cable Cósmico Umbilical de Seguridad Flotante
        parts.push({
            w: 3.0, c: C.gold, c2: C.amber, b: 1.35,
            fn: P.curve(t => {
                const a = [-4.5, -2, -6.5], b = [-16, -12, -5], c = [-24, 0, -2];
                const s = 1 - t;
                return [
                    s * s * a[0] + 2 * s * t * b[0] + t * t * c[0],
                    s * s * a[1] + 2 * s * t * b[1] + t * t * c[1],
                    s * s * a[2] + 2 * s * t * b[2] + t * t * c[2]
                ];
            }, 0.04, 32)
        });

        return buildShape(parts, { size: 56, transform: compose(rotY(-0.35), rotX(0.08)), pivot: elbowR });
    }

    const shapes = [makeRocket(), makeSatellite(), makeEye(), makeAstronaut()];

    // Trayectorias de dispersión cósmica
    const particleDispersions = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const ang = rnd(0, TAU), dist = rnd(20, 52);
        particleDispersions[i * 3] = Math.cos(ang) * dist;
        particleDispersions[i * 3 + 1] = rnd(-28, 28);
        particleDispersions[i * 3 + 2] = Math.sin(ang) * dist * 0.7;
    }

    // Geometría y atributos
    const currentPositions = new Float32Array(PARTICLE_COUNT * 3);
    const currentColors = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        currentPositions[i * 3] = shapes[0].pos[i * 3];
        currentPositions[i * 3 + 1] = shapes[0].pos[i * 3 + 1];
        currentPositions[i * 3 + 2] = shapes[0].pos[i * 3 + 2];
        currentColors.set(shapes[0].col.subarray(i * 3, i * 3 + 3), i * 3);
        sizes[i] = Math.random() < 0.05 ? rnd(1.8, 2.4) : rnd(0.9, 1.35);
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(currentPositions, 3));
    particleGeometry.setAttribute('aColor', new THREE.BufferAttribute(currentColors, 3));
    particleGeometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

    // Shader ultra-nítido con renderizado de disco perfecto y halo
    const particleMaterial = new THREE.ShaderMaterial({
        uniforms: {
            uSize: { value: isMobile ? 3.0 : 2.75 },
            uPixelRatio: { value: renderer.getPixelRatio() },
            uOpacity: { value: 1.0 }
        },
        vertexShader: `
            attribute vec3 aColor;
            attribute float aSize;
            uniform float uSize;
            uniform float uPixelRatio;
            varying vec3 vColor;
            varying float vAlpha;
            void main() {
                vec4 mv = modelViewMatrix * vec4(position, 1.0);
                gl_Position = projectionMatrix * mv;
                float dist = -mv.z;
                gl_PointSize = uSize * aSize * uPixelRatio * (70.0 / max(dist, 10.0));
                vColor = aColor;
                vAlpha = clamp(1.3 - (dist - 50.0) / 70.0, 0.4, 1.0);
            }
        `,
        fragmentShader: `
            uniform float uOpacity;
            varying vec3 vColor;
            varying float vAlpha;
            void main() {
                vec2 c = gl_PointCoord - 0.5;
                float d = length(c);
                if (d > 0.5) discard;
                float a = smoothstep(0.5, 0.08, d);
                gl_FragColor = vec4(vColor, a * vAlpha * uOpacity);
            }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });

    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);

    // -------------------------------------------------------------------------
    // Layout Equilibrado y Centrado para Cada Momento
    // -------------------------------------------------------------------------
    let halfW = 1, halfH = 1;
    function layoutShapes() {
        const Wpx = window.innerWidth;
        halfH = camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
        halfW = halfH * camera.aspect;
        const narrow = Wpx < 960;

        shapes.forEach((s, i) => {
            const L = { x: 0, y: 0, z: 0, scale: 1, op: 1 };
            if (narrow) {
                L.scale = Math.min(0.9, (2 * halfW * 0.85) / s.w, (2 * halfH * 0.42) / s.h);
                L.y = halfH * 0.22;
                L.x = 0;
                L.op = 0.85;
                if (i === 0) {
                    // En mobile: cohete 10% más grande, invertido hacia la izquierda, fuego a la derecha, posicionado arriba a la derecha para no tapar texto blanco
                    L.scale = Math.min(0.80, (2 * halfW * 0.75) / s.w, (2 * halfH * 0.31) / s.h);
                    L.y = halfH * 0.48;
                    L.x = halfW * 0.26;
                }
            } else if (i === 0) {
                // 1. HERO (Cohete): Dominante y enérgico a la derecha, posicionado más abajo para no tocar el header
                L.scale = 1.05;
                L.x = halfW * 0.38;
                L.y = -halfH * 0.27;
                L.z = 0;
                L.op = 1.0;
            } else if (i === 1) {
                // 2. SOLUCIONES (Satélite): Derecha, centrado perfectamente (equidistante entre header y borde inferior)
                L.scale = 0.88;
                L.x = halfW * 0.40;
                L.y = -halfH * 0.15;
                L.z = 0;
                L.op = 1.0;
            } else if (i === 2) {
                // 3. VISIÓN IA (Ojo cibernético): Derecha, imponente y frontal
                L.scale = 1.02;
                L.x = halfW * 0.40;
                L.y = 0;
                L.z = 0;
                L.op = 1.0;
            } else if (i === 3) {
                // 4. CONTACTO (Astronauta): Posicionado más abajo para no taparse con el header
                L.scale = 0.86;
                L.x = halfW * 0.40;
                L.y = -halfH * 0.14;
                L.z = 0;
                L.op = 1.0;
            }
            s.layout = L;
        });
        particleMaterial.uniforms.uPixelRatio.value = renderer.getPixelRatio();
    }
    layoutShapes();
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        layoutShapes();
    });

    // -------------------------------------------------------------------------
    // Transiciones Centradas en Cada Momento con Mesetas Estables
    // -------------------------------------------------------------------------
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
    const sectionEls = Array.from(document.querySelectorAll('.scene-section')).slice(0, 4);

    let targetProgress = 0;
    let progress = 0;

    function computeTargetProgress() {
        const vh = window.innerHeight;
        const scrollY = window.scrollY;
        const viewCenter = scrollY + vh * 0.5;

        // Centros verticales de cada una de las 4 escenas
        const centers = sectionEls.map(el => {
            const rect = el.getBoundingClientRect();
            return scrollY + rect.top + rect.height * 0.5;
        });

        if (viewCenter <= centers[0]) return 0;
        if (viewCenter >= centers[3]) return 3;

        for (let k = 0; k < 3; k++) {
            const c1 = centers[k];
            const c2 = centers[k + 1];
            if (viewCenter >= c1 && viewCenter <= c2) {
                const t = (viewCenter - c1) / (c2 - c1);
                // Meseta: en el 25% inicial y final de la sección, la figura está 100% armada y quieta
                let morphT = 0;
                if (t < 0.22) {
                    morphT = 0;
                } else if (t > 0.78) {
                    morphT = 1;
                } else {
                    const normT = (t - 0.22) / (0.78 - 0.22);
                    morphT = normT * normT * (3 - 2 * normT); // Smooth cubic ease
                }
                return k + morphT;
            }
        }
        return 0;
    }

    function updateScrollState() {
        targetProgress = computeTargetProgress();

        const scrollTop = window.scrollY;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const overallRatio = scrollHeight > 0 ? Math.min(Math.max(scrollTop / scrollHeight, 0), 1) : 0;

        const activeIdx = Math.round(targetProgress);
        if (shapeNameEl && shapeNames[activeIdx]) shapeNameEl.innerText = shapeNames[activeIdx];
        navItems.forEach((item, idx) => item.classList.toggle('active', idx === activeIdx));
        railMarkers.forEach((m, idx) => m.classList.toggle('active', idx === activeIdx));
        const mobileNavItemsList = document.querySelectorAll('.mobile-nav-item');
        mobileNavItemsList.forEach((m, idx) => m.classList.toggle('active', idx === activeIdx));
        if (scrollBar) scrollBar.style.height = `${overallRatio * 100}%`;
    }

    window.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('load', updateScrollState);
    updateScrollState();

    window.__debugEngine = {
        setShape: (idx) => {
            targetProgress = idx;
            progress = idx;
        },
        getProgress: () => progress,
        shapes: shapes
    };

    // -------------------------------------------------------------------------
    // Mouse: Parallax e Interacción de Campo
    // -------------------------------------------------------------------------
    let mouseX = 0, mouseY = 0, mouseActive = false;
    window.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
        mouseActive = true;
    });

    // -------------------------------------------------------------------------
    // Bucle de Render Principal
    // -------------------------------------------------------------------------
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        const dt = Math.min(clock.getDelta(), 0.1);
        const time = clock.getElapsedTime();

        // Progreso fluido entre mesetas (frame-rate independent con delta time)
        const lerpFactor = 1.0 - Math.exp(-12.0 * dt);
        progress += (targetProgress - progress) * lerpFactor;
        if (Math.abs(targetProgress - progress) < 0.001) progress = targetProgress;

        const cur = Math.min(Math.floor(progress), 3);
        const nxt = Math.min(cur + 1, 3);
        const f = progress - cur;
        const m = f * f * (3 - 2 * f);
        const diss = Math.sin(f * Math.PI); // Pico de dispersión a mitad de camino

        // Posición, escala y opacidad interpoladas
        const L1 = shapes[cur].layout, L2 = shapes[nxt].layout;
        const sc = lerp(L1.scale, L2.scale, m);
        particleSystem.position.set(
            lerp(L1.x, L2.x, m),
            lerp(L1.y, L2.y, m) + Math.sin(time * 0.8) * 0.5,
            lerp(L1.z, L2.z, m)
        );
        particleSystem.scale.setScalar(sc);
        particleMaterial.uniforms.uOpacity.value = lerp(L1.op, L2.op, m);

        // Rotación con parallax de mouse suave
        const targetRotY = (mouseActive ? mouseX * 0.28 : 0) + Math.sin(time * 0.2) * 0.12;
        const targetRotX = (mouseActive ? -mouseY * 0.16 : 0);
        particleSystem.rotation.y += (targetRotY - particleSystem.rotation.y) * 0.05;
        particleSystem.rotation.x += (targetRotX - particleSystem.rotation.x) * 0.05;

        starField.rotation.y = time * 0.015;
        starField.rotation.x = time * 0.008;

        const A = shapes[cur], B = shapes[nxt];
        const pos = particleGeometry.attributes.position.array;
        const col = particleGeometry.attributes.aColor.array;

        // Saludo del astronauta: rotación del antebrazo sobre el codo
        const wave = Math.sin(time * 3.4) * 0.45;
        const cw = Math.cos(wave), sw = Math.sin(wave);
        const pvA = cur === 3 ? A.pivot : null;
        const pvB = nxt === 3 ? B.pivot : null;

        // Vórtice de remolino durante la transición de materia
        const swirl = time * 1.0 + f * 5.2;
        const cs = Math.cos(swirl), ss = Math.sin(swirl);

        // Coordenadas locales del mouse
        const mlx = (mouseX * halfW - particleSystem.position.x) / sc;
        const mly = (mouseY * halfH - particleSystem.position.y) / sc;
        const R2 = 45;
        const springSpeed = diss > 0.05 ? 12.0 : 20.0;
        const spring = 1.0 - Math.exp(-springSpeed * dt);

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const i3 = i * 3;

            let ax = A.pos[i3], ay = A.pos[i3 + 1], az = A.pos[i3 + 2];
            if (cur === 0 && window.innerWidth < 768) {
                ax = -ax; // Invertir cohete en mobile: punta a la izquierda, fuego a la derecha
            }
            if (pvA && A.tag[i] === 1) {
                const dx = ax - pvA[0], dy = ay - pvA[1];
                ax = pvA[0] + dx * cw - dy * sw;
                ay = pvA[1] + dx * sw + dy * cw;
            }
            let bx = B.pos[i3], by = B.pos[i3 + 1], bz = B.pos[i3 + 2];
            if (nxt === 0 && window.innerWidth < 768) {
                bx = -bx;
            }
            if (pvB && B.tag[i] === 1) {
                const dx = bx - pvB[0], dy = by - pvB[1];
                bx = pvB[0] + dx * cw - dy * sw;
                by = pvB[1] + dx * sw + dy * cw;
            }

            let tx = ax + (bx - ax) * m;
            let ty = ay + (by - ay) * m;
            let tz = az + (bz - az) * m;

            if (diss > 0.002) {
                const dX = particleDispersions[i3], dY = particleDispersions[i3 + 1], dZ = particleDispersions[i3 + 2];
                tx += (dX * cs - dZ * ss) * diss;
                ty += dY * diss;
                tz += (dX * ss + dZ * cs) * diss;
            }

            // Micromovimiento orgánico vivo (mayor en la llama del cohete)
            const ag = 0.035 + A.agit[i] * (1 - m) + B.agit[i] * m;
            tx += Math.sin(time * 2.2 + i * 1.5) * ag;
            ty += Math.cos(time * 2.8 + i * 1.2) * ag;

            if (mouseActive) {
                const dx = pos[i3] - mlx, dy = pos[i3 + 1] - mly;
                const d2 = dx * dx + dy * dy;
                if (d2 < R2 && d2 > 0.01) {
                    const d = Math.sqrt(d2), force = (1 - d2 / R2) * 2.4;
                    tx += (dx / d) * force;
                    ty += (dy / d) * force;
                }
            }

            pos[i3] += (tx - pos[i3]) * spring;
            pos[i3 + 1] += (ty - pos[i3 + 1]) * spring;
            pos[i3 + 2] += (tz - pos[i3 + 2]) * spring;

            col[i3] = A.col[i3] + (B.col[i3] - A.col[i3]) * m;
            col[i3 + 1] = A.col[i3 + 1] + (B.col[i3 + 1] - A.col[i3 + 1]) * m;
            col[i3 + 2] = A.col[i3 + 2] + (B.col[i3 + 2] - A.col[i3 + 2]) * m;
        }

        particleGeometry.attributes.position.needsUpdate = true;
        particleGeometry.attributes.aColor.needsUpdate = true;
        renderer.render(scene, camera);
    }

    animate();

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
            title: 'Visión IT: Detector Neuronal de Rostros',
            desc: `Visión IT es un sistema de inspección biométrica y óptica inteligente desarrollado con redes neuronales convolucionales ultralivianas (BlazeFace sobre WebGL) para detectar rostros humanos en tiempo real con latencia sub-milisegundo.<br><br>
            <strong>💎 Capacidades Actuales</strong><br>
            • <b>Detección de Rostros en Tiempo Real:</b> Localización instantánea de rostros y landmarks anatómicos directamente en el navegador con aceleración GPU.<br>
            • <b>Alertas Críticas a Telegram:</b> Captura fotográfica automatizada y notificación instantánea con porcentaje de confianza biométrica.<br>
            • <b>Consola de Sensibilidad Dinámica:</b> Calibración al vuelo de umbrales de precisión para adaptarse a cualquier iluminación ambiental.<br>
            • <b>Historial y Auditoría:</b> Registro continuo de eventos y generación de reportes técnicos exportables a PDF.<br><br>
            <strong>🔮 Aplicaciones Industriales</strong><br>
            • Detección de presencia y control de accesos sin contacto.<br>
            • Conteo inteligente y auditoría de flujo de personas en tiempo real.<br>
            • Monitoreo automatizado para seguridad y supervisión de espacios.`,
            icon: '👁️',
            link: 'https://vision-it-six.vercel.app/'
        },
        'educativa': {
            title: 'Gestión Educativa: Sistema Académico 360°',
            desc: `Plataforma integral de transformación digital y gestión académica escolar (Colegio Cruz del Sur). Diseñada para eliminar el papeleo administrativo y unificar la comunicación y el seguimiento pedagógico en tiempo real.<br><br>
            <strong>💎 Funcionalidades Clave</strong><br>
            • <b>Boletines y Calificaciones Digitales:</b> Carga ágil por trimestres, cálculo automático de promedios ponderados y emisión instantánea de informes.<br>
            • <b>Control de Asistencia y Legajos 360°:</b> Registro diario de presentismo, alertas tempranas de ausentismo e historial pedagógico unificado por alumno.<br>
            • <b>Portal Multi-Rol (Docentes / Familias):</b> Accesos seguros y diferenciados para gestión de materias, avisos y seguimiento del rendimiento escolar.<br>
            • <b>Comunicados y Calendario Institucional:</b> Canal oficial de notificaciones, fechas de exámenes y eventos escolares sin depender de grupos informales.<br>
            • <b>PWA Offline-Ready:</b> Diseñada para operar fluidamente tanto en computadoras de secretaría como en teléfonos celulares de preceptores y docentes.`,
            icon: '🎓',
            link: 'https://gestion-educativa-digital.vercel.app/'
        }
    };

    const modal = document.getElementById('service-modal');
    const modalBody = document.getElementById('modal-body');
    const closeModalBtn = document.getElementById('close-modal');

    // Cards click triggers (Soporte mobile tap + botón "Ver más")
    const allHudCards = document.querySelectorAll('.hud-card');
    const visionBox = document.querySelector('.vision-highlight-box');

    allHudCards.forEach(card => {
        const key = card.getAttribute('data-key');
        if (!key) return;

        card.addEventListener('click', (e) => {
            const isTouch = window.innerWidth < 1024 || window.matchMedia('(pointer: coarse)').matches;
            if (isTouch) {
                const isCardActive = card.classList.contains('active');
                const clickedBtn = e.target.closest('.card-action-btn');

                if (!isCardActive && !clickedBtn) {
                    allHudCards.forEach(c => c.classList.remove('active'));
                    if (visionBox) visionBox.classList.remove('active');
                    card.classList.add('active');
                    e.stopPropagation();
                    return;
                }
            }
            openServiceModal(key);
        });
    });

    // Vision box trigger (clicking box or button opens modal)
    if (visionBox) {
        visionBox.addEventListener('click', (e) => {
            if (e.target.closest('a')) return; // Allow clicking external demo link
            const isTouch = window.innerWidth < 1024 || window.matchMedia('(pointer: coarse)').matches;
            if (isTouch) {
                const isBoxActive = visionBox.classList.contains('active');
                const clickedBtn = e.target.closest('#open-vision-case');

                if (!isBoxActive && !clickedBtn) {
                    allHudCards.forEach(c => c.classList.remove('active'));
                    visionBox.classList.add('active');
                    e.stopPropagation();
                    return;
                }
            }
            openServiceModal('vision');
        });
    }

    // Tocar fuera desactiva las tarjetas activas en móvil
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.hud-card') && !e.target.closest('.vision-highlight-box')) {
            allHudCards.forEach(c => c.classList.remove('active'));
            if (visionBox) visionBox.classList.remove('active');
        }
    });

    function openServiceModal(key) {
        const data = serviceData[key];
        if (!data) return;

        let content = `
            <div style="text-align: center; margin-bottom: 1.5rem;">
                <span style="font-size: 3.5rem; display: block; filter: drop-shadow(0 0 15px rgba(56, 189, 248, 0.4));">${data.icon}</span>
                <h2 style="margin-top: 0.8rem; font-family: var(--font-display); font-size: 1.8rem; color: #fff;">${data.title}</h2>
            </div>
            <div class="modal-service-desc" style="color: rgba(226, 232, 240, 0.85); font-size: 1rem; line-height: 1.7; margin-bottom: 1.5rem; text-align: justify; text-justify: inter-word;">
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

    // -------------------------------------------------------------------------
    // Mobile Menu Toggle & Navigation (Las dos rayitas del header)
    // -------------------------------------------------------------------------
    const menuToggle = document.getElementById('menu-toggle');
    const mobileNavDrawer = document.getElementById('mobile-nav-drawer');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-item');

    if (menuToggle && mobileNavDrawer) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = mobileNavDrawer.classList.contains('active');
            if (isOpen) {
                menuToggle.classList.remove('active');
                mobileNavDrawer.classList.remove('active');
            } else {
                menuToggle.classList.add('active');
                mobileNavDrawer.classList.add('active');
            }
        });

        mobileNavLinks.forEach(item => {
            item.addEventListener('click', (e) => {
                const targetHref = item.getAttribute('href');
                if (targetHref && targetHref.startsWith('#')) {
                    const targetEl = document.querySelector(targetHref);
                    if (targetEl) {
                        e.preventDefault();
                        targetEl.scrollIntoView({ behavior: 'smooth' });
                    }
                }
                menuToggle.classList.remove('active');
                mobileNavDrawer.classList.remove('active');
            });
        });

        // Cerrar al tocar fuera del menú
        document.addEventListener('click', (e) => {
            if (!mobileNavDrawer.contains(e.target) && !menuToggle.contains(e.target)) {
                menuToggle.classList.remove('active');
                mobileNavDrawer.classList.remove('active');
            }
        });
    }

    // =========================================================================
    // 3. CURSOR CON EFECTO LUPA Y DISPERSIÓN ATÓMICA EN PALABRAS (SOLO DESKTOP)
    //    (EXCLUYE TARJETAS, BOTONES E INTERACCIONES; DESACTIVADO EN CELULARES)
    // =========================================================================
    const cursorEl = document.getElementById('cursor');
    const cursorTrailEl = document.getElementById('cursor-trail');
    const atomCanvas = document.getElementById('atom-cursor-canvas');

    const isMobileDevice = window.innerWidth < 1024 ||
                           window.matchMedia('(pointer: coarse)').matches ||
                           ('ontouchstart' in window) ||
                           (navigator.maxTouchPoints > 0);

    if (cursorEl && atomCanvas && !isMobileDevice) {
        const ctx = atomCanvas.getContext('2d');
        let dpr = window.devicePixelRatio || 1;

        function resizeAtomCanvas() {
            dpr = window.devicePixelRatio || 1;
            atomCanvas.width = window.innerWidth * dpr;
            atomCanvas.height = window.innerHeight * dpr;
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.scale(dpr, dpr);
        }
        resizeAtomCanvas();
        window.addEventListener('resize', resizeAtomCanvas);

        // 1. Selector de textos fuera de tarjetas y botones
        const candidateSelectors = [
            '.main-headline',
            '.section-headline',
            '.contact-giant-title',
            '.hero-statement',
            '.section-subtext',
            '.tag-title',
            '.scroll-hint .hint-text',
            '.footer-copy'
        ];

        function isInteractiveElement(node) {
            if (!node || !(node instanceof Element)) return false;
            return !!node.closest(
                'button, a, input, textarea, select, ' +
                '.hud-card, .vision-highlight-box, .hud-contact-card, ' +
                '.hud-header, .hud-scroll-rail, .modal-content, .modal-overlay, ' +
                '.menu-toggle, .btn-cosmic-primary, .btn-cosmic-ghost, [data-key]'
            );
        }

        candidateSelectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(container => {
                if (isInteractiveElement(container)) return;

                const textNodes = [];
                const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
                    acceptNode: (n) => {
                        if (n.parentElement && (
                            n.parentElement.classList.contains('atom-word') ||
                            n.parentElement.tagName === 'SCRIPT' ||
                            n.parentElement.tagName === 'STYLE'
                        )) {
                            return NodeFilter.FILTER_REJECT;
                        }
                        if (n.nodeValue.trim().length > 0) {
                            return NodeFilter.FILTER_ACCEPT;
                        }
                        return NodeFilter.FILTER_SKIP;
                    }
                });

                while (walker.nextNode()) {
                    textNodes.push(walker.currentNode);
                }

                textNodes.forEach(node => {
                    const parent = node.parentNode;
                    if (!parent) return;

                    const text = node.nodeValue;
                    const tokens = text.split(/(\s+)/);
                    const frag = document.createDocumentFragment();

                    tokens.forEach(tok => {
                        if (/^\s+$/.test(tok)) {
                            frag.appendChild(document.createTextNode(tok));
                        } else if (tok.length > 0) {
                            const span = document.createElement('span');
                            span.className = 'atom-word';
                            span.textContent = tok;
                            frag.appendChild(span);
                        }
                    });

                    parent.replaceChild(frag, node);
                });
            });
        });

        const atomWordElements = Array.from(document.querySelectorAll('.atom-word'));

        // 2. Partículas atómicas cuánticas que se dispersan en el canvas
        const atomParticles = [];
        const ATOM_COLORS = ['#06b6d4', '#38bdf8', '#a855f7', '#fbbf24', '#ffffff'];

        function spawnAtomParticles(x, y, vxBase, vyBase, count = 2) {
            for (let i = 0; i < count; i++) {
                if (atomParticles.length > 180) break;
                const angle = Math.random() * Math.PI * 2;
                const speed = 1.6 + Math.random() * 4.0;
                atomParticles.push({
                    x: x + (Math.random() - 0.5) * 14,
                    y: y + (Math.random() - 0.5) * 14,
                    vx: vxBase * 0.35 + Math.cos(angle) * speed,
                    vy: vyBase * 0.35 + Math.sin(angle) * speed,
                    size: 1.2 + Math.random() * 2.2,
                    color: ATOM_COLORS[Math.floor(Math.random() * ATOM_COLORS.length)],
                    life: 1.0,
                    decay: 0.032 + Math.random() * 0.03
                });
            }
        }

        // 3. Seguimiento de mouse e interacciones
        let mouseClientX = -1000, mouseClientY = -1000;
        let smoothCursorX = -1000, smoothCursorY = -1000;
        let isCursorVisible = false;
        let currentTarget = null;
        let activeDisplacedWords = new Set();

        window.addEventListener('mousemove', (e) => {
            mouseClientX = e.clientX;
            mouseClientY = e.clientY;
            currentTarget = e.target;

            if (!isCursorVisible) {
                isCursorVisible = true;
                cursorEl.classList.add('visible');
                if (cursorTrailEl) cursorTrailEl.classList.add('visible');
                smoothCursorX = mouseClientX;
                smoothCursorY = mouseClientY;
            }
        });

        window.addEventListener('mouseleave', () => {
            isCursorVisible = false;
            cursorEl.classList.remove('visible');
            if (cursorTrailEl) cursorTrailEl.classList.remove('visible');
            resetAllDisplacedWords();
        });

        function resetAllDisplacedWords() {
            activeDisplacedWords.forEach(word => {
                word.style.transform = '';
                word.style.textShadow = '';
                word.classList.remove('displaced');
                word._currPushX = 0;
                word._currPushY = 0;
            });
            activeDisplacedWords.clear();
        }

        // Bucle de renderizado para cursor, dispersión y lupa
        const LENS_RADIUS = 95;
        const MAX_PUSH_X = 22;
        const MAX_PUSH_Y = 14;

        function updateCursorAndAtoms() {
            // Suavizado del cursor follower
            if (isCursorVisible) {
                smoothCursorX += (mouseClientX - smoothCursorX) * 0.35;
                smoothCursorY += (mouseClientY - smoothCursorY) * 0.35;

                cursorEl.style.transform = `translate3d(${smoothCursorX}px, ${smoothCursorY}px, 0) translate(-50%, -50%)`;
                if (cursorTrailEl) {
                    cursorTrailEl.style.transform = `translate3d(${mouseClientX}px, ${mouseClientY}px, 0) translate(-50%, -50%)`;
                }

                const overInteractive = isInteractiveElement(currentTarget);

                if (overInteractive) {
                    // Exclusión estricta de tarjetas, botones e interacciones
                    cursorEl.classList.remove('lens-active');
                    cursorEl.classList.add('pointer-active');
                    resetAllDisplacedWords();
                } else {
                    cursorEl.classList.remove('pointer-active');

                    let nearWordCount = 0;
                    const nextActiveWords = new Set();

                    // Evaluar palabras en pantalla
                    for (let i = 0; i < atomWordElements.length; i++) {
                        const word = atomWordElements[i];
                        const rect = word.getBoundingClientRect();

                        // Descartar si está fuera de viewport vertical
                        if (rect.bottom < -40 || rect.top > window.innerHeight + 40) {
                            if (activeDisplacedWords.has(word)) {
                                word.style.transform = '';
                                word.style.textShadow = '';
                                word.classList.remove('displaced');
                                word._currPushX = 0;
                                word._currPushY = 0;
                            }
                            continue;
                        }

                        // Usar el centro sin desplazamiento para evitar oscilación
                        const currentX = rect.left + rect.width * 0.5;
                        const currentY = rect.top + rect.height * 0.5;
                        const origCenterX = currentX - (word._currPushX || 0);
                        const origCenterY = currentY - (word._currPushY || 0);

                        const dx = origCenterX - mouseClientX;
                        const dy = origCenterY - mouseClientY;
                        const dist = Math.hypot(dx, dy);

                        if (dist < LENS_RADIUS) {
                            nearWordCount++;
                            nextActiveWords.add(word);
                            activeDisplacedWords.add(word);

                            const force = 1 - (dist / LENS_RADIUS);
                            const pushForce = Math.pow(force, 1.15);

                            // Dispersión radial (empuje de átomos alejándose del mouse)
                            const angle = Math.atan2(dy, dx);
                            const pushX = Math.cos(angle) * pushForce * MAX_PUSH_X;
                            const pushY = Math.sin(angle) * pushForce * MAX_PUSH_Y;

                            word._currPushX = pushX;
                            word._currPushY = pushY;

                            // Efecto Lupa: magnificación de escala bajo el foco del cursor
                            const scale = 1 + pushForce * 0.32;

                            word.style.transform = `translate3d(${pushX}px, ${pushY}px, 0) scale(${scale})`;
                            word.style.textShadow = `0 0 ${12 * force}px rgba(6, 182, 212, ${0.9 * force}), 0 0 ${24 * force}px rgba(59, 130, 246, ${0.65 * force})`;
                            word.classList.add('displaced');

                            // Dispersar átomos cuánticos flotantes desde la palabra
                            if (Math.random() < 0.65) {
                                spawnAtomParticles(
                                    origCenterX + (Math.random() - 0.5) * rect.width,
                                    origCenterY + (Math.random() - 0.5) * rect.height,
                                    Math.cos(angle) * 3,
                                    Math.sin(angle) * 3,
                                    2
                                );
                            }
                        }
                    }

                    // Resetear palabras que ya no están en rango
                    activeDisplacedWords.forEach(word => {
                        if (!nextActiveWords.has(word)) {
                            word.style.transform = '';
                            word.style.textShadow = '';
                            word.classList.remove('displaced');
                            word._currPushX = 0;
                            word._currPushY = 0;
                            activeDisplacedWords.delete(word);
                        }
                    });

                    // Activar o desactivar efecto lupa en el cursor
                    if (nearWordCount > 0) {
                        cursorEl.classList.add('lens-active');
                    } else {
                        cursorEl.classList.remove('lens-active');
                    }
                }
            }

            // Renderizar partículas atómicas en el canvas 2D
            ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

            for (let i = atomParticles.length - 1; i >= 0; i--) {
                const p = atomParticles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.vx *= 0.94;
                p.vy *= 0.94;
                p.life -= p.decay;

                if (p.life <= 0) {
                    atomParticles.splice(i, 1);
                    continue;
                }

                ctx.save();
                ctx.globalAlpha = Math.max(0, p.life);
                ctx.fillStyle = p.color;
                ctx.shadowBlur = 10;
                ctx.shadowColor = p.color;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }

            requestAnimationFrame(updateCursorAndAtoms);
        }

        requestAnimationFrame(updateCursorAndAtoms);
    }

    // =========================================================================
    // 4. PWA SERVICE WORKER REGISTRATION (INSTALACION EN CELULAR)
    // =========================================================================
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(reg => console.log('Taller IT PWA registrado con éxito:', reg.scope))
                .catch(err => console.log('Error registrando Service Worker:', err));
        });
    }
});
