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
            title: '🚀 Podal Fix: Gestión Podológica de Precisión',
            desc: `Esta plataforma redefine la administración de servicios de podología y salud animal. Diseñada para profesionales que buscan un control riguroso, Podal Fix elimina la carga administrativa manual, permitiendo un seguimiento técnico exhaustivo.<br><br>
            <strong>💎 Funcionalidades Actuales (MVP Beta)</strong><br>
            • <b>Dashboard Inteligente</b>: Panel de control con métricas clave y acceso rápido.<br>
            • <b>Gestión de Pacientes y Rodeos</b>: Clasificación detallada por caravanas y establecimientos.<br>
            • <b>Agenda Profesional</b>: Sistema de turnos optimizado para el trabajo en campo.<br>
            • <b>Historias Clínicas Digitales</b>: Registro de patologías, tratamientos y notas técnicas.<br>
            • <b>Control Multi-Establecimiento</b>: Gestiona diferentes locaciones desde una interfaz central.<br>
            • <b>Notificaciones de Rechequeo</b>: Alertas para el seguimiento de casos pendientes.<br>
            • <b>Interfaz Mobile-Responsive</b>: Adaptada para tablets y celulares.<br><br>
            <strong>🔮 Visión de Futuro: El Nexo Digital (Próximas Mejoras)</strong><br>
            • <b>Sincronización Offline</b>: Capacidad de trabajar sin conexión a internet.<br>
            • <b>Reportes Técnicos Automatizados</b>: Generación de informes profesionales con un clic.<br>
            • <b>Galería de Imágenes Clínicas</b>: Guardado de fotos del estado directamente en la ficha.<br>
            • <b>Portal del Cliente</b>: Acceso para dueños de establecimientos.<br>
            • <b>Integración de Voz</b>: Dictado de notas mientras se realiza el trabajo manual.`,
            icon: '📋',
            image: 'assets/podal_fix_dashboard.png',
            link: 'https://podalfix.vercel.app/'
        },
        'gestion': {
            title: 'Sistemas de Gestión',
            desc: 'Desarrollamos herramientas a medida para el control de tu negocio. **Toca Tocar** es un ejemplo de cómo una interfaz intuitiva puede facilitar la coordinación de tareas, inventarios y flujos de trabajo complejos.',
            icon: '⚙️'
        },
        'chatbot': {
            title: 'Chat Bots Inteligentes',
            desc: 'Automatizamos la comunicación con tus clientes. Estamos trabajando en soluciones que integran IA para responder consultas frecuentes, agendar citas y procesar pedidos de forma autónoma 24/7.',
            icon: '🤖'
        },
        'vision': {
            title: 'Visión Artificial',
            desc: 'Utilizamos tecnología de vanguardia para procesar imágenes. **Visión IT** es un ejemplo real que detecta objetos en tiempo real, facilitando inventarios y controles automáticos.',
            icon: '👁️',
            link: 'https://vision-it-phi.vercel.app'
        },
        'pilates': {
            title: '🚀 VN Pilates: Gestión Inteligente',
            desc: `Esta app no es solo un software de administración; es una herramienta de precisión diseñada para potenciar la rentabilidad de los centros de bienestar y fitness. Nuestra plataforma permite a quien emprende delegar las tareas administrativas pesadas para enfocarse en lo que realmente importa: sus alumnos.<br><br>
            <strong>💎 Funcionalidades Actuales (MVP Beta)</strong><br>
            • <b>Gestión Centralizada de Alumnos</b>: Registro detallado, control de asistencias y seguimiento de actividad en tiempo real.<br>
            • <b>Inteligencia Financiera</b>: Panel de control con cálculo automático de ingresos, gastos operativos y balances de ganancia neta.<br>
            • <b>Cálculo Automatizado de Honorarios</b>: Sistema inteligente de liquidación para profesores basado en horas trabajadas y valores variables.<br>
            • <b>Reportes de Gestión "One-Click"</b>: Generación instantánea de reportes generales y detallados.<br>
            • <b>Exportación Profesional</b>: Soporte completo para exportación de datos a Excel y PDF.<br>
            • <b>Sincronización Híbrida</b>: Importación desde CSV y sincronización mediante enlaces dinámicos.<br>
            • <b>Experiencia Mobile-First</b>: Interfaz 100% responsiva para celular y computadora.<br><br>
            <strong>🔮 Visión de Futuro: El Nexo Digital (Próximas Mejoras)</strong><br>
            • <b>Ecosystem Online (Nube)</b>: Migración a bases de datos en tiempo real.<br>
            • <b>Portal de Autenticación</b>: Logueo seguro para administradores, profesores y alumnos.<br>
            • <b>Ficha Médica Digital</b>: Seguimiento clínico avanzado de los alumnos.<br>
            • <b>Notificaciones Inteligentes</b>: Alertas vía WhatsApp/Email para vencimientos y recordatorios.<br>
            • <b>Agenda Dinámica</b>: Motor de citas con sugerencias de horarios óptimos.<br>
            • <b>Plataforma de E-Learning</b>: Integración de cursos y videos exclusivos.`,
            icon: '🧘',
            image: 'assets/vn_pilates_dashboard.png',
            link: 'https://vn-pilates.vercel.app/'
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
