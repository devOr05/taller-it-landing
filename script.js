document.addEventListener('DOMContentLoaded', () => {
    // Intersection Observer for Scroll Reveal
    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('active');
        });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({ behavior: 'smooth' });
        });
    });

    // Content for Modals
    const serviceData = {
        'digitalizacion': {
            title: 'Podal Fix: Gestión Podológica',
            desc: `Esta plataforma redefine la administración de servicios de podología y salud animal. Diseñada para profesionales que buscan un control riguroso, Podal Fix elimina la carga administrativa manual, permitiendo un seguimiento técnico exhaustivo y una organización impecable de la jornada de trabajo.<br><br>
            <strong>💎 Funcionalidades Actuales</strong><br>
            • Dashboard Inteligente: Panel de control con métricas clave y acceso rápido a los establecimientos activos.<br>
            • Gestión de Pacientes y Rodeos: Clasificación detallada por caravanas, establecimientos y categorías con búsqueda instantánea.<br>
            • Agenda Profesional: Sistema de turnos y programación de visitas optimizado para el trabajo en campo.<br>
            • Historias Clínicas Digitales: Registro exhaustivo de patologías, tratamientos y notas técnicas por cada animal.<br>
            • Control Multi-Establecimiento: Capacidad de gestionar diferentes clientes o locaciones desde una única interfaz centralizada.<br>
            • Notificaciones de Rechequeo: Sistema de alertas para el seguimiento de casos pendientes.<br>
            • Interfaz Mobile-Responsive: Perfectamente adaptada para su uso en tablets y celulares durante las inspecciones técnicas.<br><br>
            <strong>🔮 Visión de Futuro: El Nexo Digital (Próximas Mejoras)</strong><br>
            • Sincronización Offline: Capacidad de trabajar sin conexión a internet y sincronizar datos automáticamente al recuperar señal.<br>
            • Reportes Técnicos Automatizados: Generación de informes profesionales para clientes con un solo clic.<br>
            • Galería de Imágenes Clínicas: Adjuntar fotos del estado de las pezuñas o lesiones directamente a la ficha clínica.<br>
            • Portal del Cliente: Acceso restringido para que los dueños de establecimientos vean el estado de su rodeo.<br>
            • Integración de Voz: Capacidad de dictar notas clínicas mientras se realiza el trabajo manual.`,
            icon: '📋',
            image: 'assets/podal_fix_dashboard.png',
            link: 'https://podalfix.vercel.app/'
        },
        'gestion': {
            title: 'Toca tocar: Sistemas de Gestión',
            desc: `Toca Tocar no es solo una agenda para músicos; es el nexo digital definitivo para la cultura de las Jam Sessions. Diseñada para coordinar el caos creativo, nuestra plataforma permite a organizadores y músicos gestionar cada aspecto de un evento en vivo: desde la propuesta de temas hasta la gestión de instrumentos y chat en tiempo real, todo bajo una estética de Jazz Cub premium.<br><br>
            <strong>💎 Funcionalidades Actuales</strong><br>
            • Gestión de Jams Dinámica: Creación de eventos con códigos de acceso únicos para una organización impecable.<br>
            • Dashboard de Participantes: Visualización en tiempo real de los músicos anotados y sus instrumentos (Sax, Piano, Contrabajo, etc.).<br>
            • Base de Datos de Standards: Integración con librerías de Jazz y soporte para visualización de partituras PDF directamente en la app.<br>
            • Propuesta de Temas y Foro: Sistema interactivo para proponer qué tocar y coordinar detalles logísticos entre los músicos.<br>
            • Galería Multimedia Directa: Espacio dedicado para que los asistentes suban fotos y videos que se agrupan automáticamente por evento.<br>
            • Chat en Vivo por Tema: Comunicación fluida para que los grupos que suben al escenario estén siempre en sintonía.`,
            image: 'assets/toca_tocar_dashboard.png',
            link: 'https://toca-tocar.vercel.app/',
            icon: '⚙️'
        },
        'chatbot': {
            title: 'Chat Bots Inteligentes',
            desc: 'Automatizamos la comunicación con tus clientes. Estamos trabajando en soluciones que integran IA para responder consultas frecuentes, agendar citas y procesar pedidos de forma autónoma 24/7.',
            icon: '🤖',
            image: 'assets/chatbot_dashboard.png'
        },
        'vision': {
            title: 'Visión IT: Visión Artificial',
            desc: `Visión IT no es solo una cámara; es un sistema de inspección inteligente que utiliza redes neuronales avanzadas para ver y entender el entorno de producción. Diseñada para la industria y el control de calidad, nuestra IA permite automatizar el conteo y la clasificación de objetos con precisión quirúrgica, eliminando el error humano y acelerando los reportes de planta.<br><br>
            <strong>💎 Funcionalidades Actuales</strong><br>
            • Detección Multi-Objeto: Identificación inmediata de múltiples categorías estándar mediante modelos COCO-SSD optimizados para web.<br>
            • Entrenamiento Custom (KNN Classifier): Capacidad de "enseñar" a la app a reconocer objetos específicos de tu negocio con solo unos segundos de captura.<br>
            • Modo de Conteo por Cuadrícula: Sistema de segmentación de imagen para realizar auditorías visuales y conteos masivos en tiempo real.<br>
            • Generación de Reportes PDF: Creación instantánea de informes de producción detallados con fecha, lote y desglose de detecciones.<br>
            • Sintetizador de Voz Inteligente: Confirmación auditiva de las detecciones para permitir un flujo de trabajo "manos libres".<br>
            • Panel de Control de Sensibilidad: Ajuste fino del umbral de confianza para adaptarse a diferentes condiciones de iluminación y entorno.<br><br>
            <strong>🔮 Visión de Futuro: El Nexo Digital (Próximas Mejoras)</strong><br>
            • Integración de Edge Computing: Procesamiento aún más veloz directamente en el dispositivo para una respuesta de milisegundos.<br>
            • Detección de Anomalías: Entrenamiento automático para identificar productos defectuosos que no cumplen con el patrón visual estándar.<br>
            • Dashboard Cloud de Producción: Visualización de métricas de múltiples cámaras en una consola centralizada para supervisores.<br>
            • Alertas Críticas vía Webhook: Envío de señales a otros sistemas o maquinaria al detectar eventos específicos en la línea de visión.`,
            icon: '👁️',
            image: 'assets/vision_it_dashboard.png',
            link: 'https://vision-it-six.vercel.app/'
        },
        'pilates': {
            title: 'Gestión Flex: Sistema Inteligente',
            desc: `Esta app no es solo un software de administración; es una herramienta de precisión diseñada para potenciar la gestión de estudios, gimnasios y centros de bienestar. La plataforma permite delegar las tareas administrativas pesadas para enfocarse en lo que realmente importa: los alumnos y el equipo de trabajo.<br><br>
            <strong>💎 Funcionalidades Actuales (Beta Abierta)</strong><br>
            La versión actual transforma la dinámica diaria de cualquier centro con herramientas robustas:<br><br>
            • Gestión Centralizada: Registro detallado de alumnos, control de pagos y seguimiento de disciplinas.<br>
            • Portal Profesional Independiente: Acceso exclusivo para los profesores/personal, donde pueden ver sus propios alumnos, horarios asignados, horas trabajadas y su ganancia mensual estimada.<br>
            • Agenda Semanal Dinámica: Cuadrícula visual de todos los horarios programados del establecimiento, con exportación generativa a PDF.<br>
            • Inteligencia Financiera: Panel completo con cruce de ingresos, gastos operativos, honorarios de los profesores y ganancia neta.<br>
            • Personalización de Marca: Configuración del nombre del espacio y del tipo de clientes (Alumnos o Pacientes) para que la app se adapte a tu negocio.<br>
            • Reportes "One-Click": Generador interno para exportar planillas de alumnos a PDF y planillas generales de Excel con solo un click.<br>
            • Experiencia Mobile-First: Interfaz 100% responsiva, súper veloz y diseñada directamente para operar en celulares como en una tablet o PC.<br><br>
            <strong>🔮 Visión de Futuro (Próximas Mejoras)</strong><br>
            • Autenticación Segura (Logins privados de base de datos).<br>
            • Integraciones con calendarios para autogestión de turnos de los clientes.<br>
            • Sincronización en la Nube Multi-Dispositivo y Respaldos automáticos.`,
            icon: '🧘',
            image: 'assets/vn_pilates_dashboard.png', // Por ahora lo conservamos hasta la nueva foto
            link: 'https://gestion-flex.vercel.app/'
        }
    };

    // Modal Logic
    const modal = document.getElementById('service-modal');
    const modalBody = document.getElementById('modal-body');
    const cards = document.querySelectorAll('.card');
    const closeBtn = document.getElementById('close-modal');

    cards.forEach((card, index) => {
        card.style.cursor = 'pointer';
        const keys = ['digitalizacion', 'pilates', 'gestion', 'vision', 'chatbot'];
        const key = keys[index];

        card.addEventListener('click', () => {
            const data = serviceData[key];
            let content = `
                <span style="font-size: 4rem; display: block; margin-bottom: 1rem;">${data.icon}</span>
                <h2>${data.title}</h2>
                ${data.image ? `<img src="${data.image}" alt="${data.title}" style="width: 100%; border-radius: 20px; margin: 1.5rem 0; border: 1px solid var(--glass-border);">` : `
                <div class="modal-image-placeholder">
                    <p style="color: var(--text-muted)">Caso de estudio: ${data.title}</p>
                </div>`}
                <p>${data.desc}</p>
            `;

            if (data.link) {
                content += `<a href="${data.link}" target="_blank" class="btn-primary" style="display:inline-block; margin-top:1.5rem; text-decoration:none; padding: 0.8rem 1.5rem; border-radius: 12px; font-weight: 600;">Ver Aplicación en Vivo</a>`;
            }

            modalBody.innerHTML = content;
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    const closeModal = () => {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    };

    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Contact Modal Logic
    const contactModal = document.getElementById('contact-modal');
    const emailTrigger = document.getElementById('email-trigger');
    const closeContactBtn = document.getElementById('close-contact-modal');
    const contactForm = document.getElementById('contact-form');

    emailTrigger.addEventListener('click', (e) => {
        e.preventDefault();
        contactModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });

    const closeContactModal = () => {
        contactModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    };

    closeContactBtn.addEventListener('click', closeContactModal);
    contactModal.addEventListener('click', (e) => {
        if (e.target === contactModal) closeContactModal();
    });

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = contactForm.querySelector('button');
        const originalText = btn.innerText;
        btn.innerText = 'Enviando...';
        btn.disabled = true;

        // Simulated sending
        setTimeout(() => {
            btn.innerText = '¡Mensaje Enviado!';
            btn.style.background = '#22c55e';
            setTimeout(() => {
                closeContactModal();
                contactForm.reset();
                btn.innerText = originalText;
                btn.style.background = '';
                btn.disabled = false;
            }, 2000);
        }, 1500);
    });

    // Background Blobs
    const blobs = document.querySelectorAll('.blob');
    document.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;
        blobs.forEach((blob, index) => {
            const speed = (index + 1) * 20;
            blob.style.transform = `translate(${mouseX * speed}px, ${mouseY * speed}px)`;
        });
    });
});
