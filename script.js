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
            title: 'Digitalización de Planillas',
            desc: 'Transformamos procesos manuales en aplicaciones digitales eficientes. Por ejemplo, nuestra aplicación de **Podología** permite gestionar turnos, historias clínicas y fichas de pacientes de forma digital, eliminando el papel y los errores de transcripción.',
            icon: '📋'
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
            desc: 'Utilizamos tecnología de vanguardia para procesar imágenes. Desde reconocimiento de objetos hasta análisis de patrones complejos, crearemos aplicaciones simples que resuelvan necesidades específicas de inspección o conteo.',
            icon: '👁️'
        }
    };

    // Modal Logic
    const modal = document.getElementById('service-modal');
    const modalBody = document.getElementById('modal-body');
    const cards = document.querySelectorAll('.card');
    const closeBtn = document.getElementById('close-modal');

    cards.forEach((card, index) => {
        card.style.cursor = 'pointer';
        const keys = ['digitalizacion', 'gestion', 'chatbot', 'vision'];
        const key = keys[index];

        card.addEventListener('click', () => {
            const data = serviceData[key];
            modalBody.innerHTML = `
                <span style="font-size: 4rem; display: block; margin-bottom: 1rem;">${data.icon}</span>
                <h2>${data.title}</h2>
                <div class="modal-image-placeholder">
                    <p style="color: var(--text-muted)">Imagen del ejemplo: ${data.title}</p>
                </div>
                <p>${data.desc}</p>
            `;
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
