drop database shovel;
create database shovel;
use shovel;

CREATE TABLE recursos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(255),
    tipo VARCHAR(100),
    categoria VARCHAR(100),
    contenido TEXT,
    autor VARCHAR(255),
    tiempo_lectura INT,
    total_vistas INT,
    fecha_publicacion DATETIME
);

CREATE TABLE empresas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(255),
    email VARCHAR(255),
    contrasena VARCHAR(255),
    industria VARCHAR(255),
    tamano VARCHAR(100),
    ubicacion VARCHAR(255),
    descripcion TEXT,
    logo VARCHAR(255),
    sitio_web VARCHAR(255),
    verificada BOOLEAN,
    calificacion_promedio DECIMAL(3,2),
    total_valoraciones INT,
    fecha_registro DATETIME
);


CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre_completo VARCHAR(255),
    contrasena VARCHAR(255),
    email VARCHAR(255),
    telefono VARCHAR(50),
    ubicacion VARCHAR(255),
    titulo_profesional VARCHAR(255),
    anios_experiencia INT,
    sobre_mi TEXT,
    foto_perfil VARCHAR(255),
    foto_portada VARCHAR(255),
    linkedin_url VARCHAR(255),
    github_url VARCHAR(255),
    sitio_web VARCHAR(255),
    tipo_empleo_deseado VARCHAR(100),
    rango_salarial_esperado DECIMAL(10,2),
    disponibilidad VARCHAR(100),
    sector_preferido VARCHAR(100),
    perfil_publico BOOLEAN,
    mostrar_email BOOLEAN,
    recibir_notificaciones BOOLEAN,
    fecha_registro DATETIME,
    estado VARCHAR(50),
    rol VARCHAR(50) DEFAULT 'usuario'
);

INSERT INTO usuarios (
    nombre_completo, contrasena, email, telefono, ubicacion, titulo_profesional,
    anios_experiencia, sobre_mi, foto_perfil, foto_portada,
    linkedin_url, github_url, sitio_web, tipo_empleo_deseado,
    rango_salarial_esperado, disponibilidad, sector_preferido,
    perfil_publico, mostrar_email, recibir_notificaciones,
    fecha_registro, estado, rol
) VALUES
('Carlos Mendoza', '1234', 'carlos@gmail.com', '7890-1234', 'San Salvador', 'Desarrollador Web',
3, 'Frontend y React.', 'perfil1.jpg', 'portada1.jpg', '', 'https://github.com/carlos', '',
'Tiempo completo', 1200.00, 'Inmediata', 'Tecnología', TRUE, TRUE, TRUE, NOW(), 'Activo', 'usuario'),

('Ana López', '1234', 'ana@gmail.com', '7123-4567', 'Santa Ana', 'Diseñadora UX/UI',
4, 'Diseño centrado en usuario.', 'perfil2.jpg', 'portada2.jpg', 'https://linkedin.com/ana', '', '',
'Remoto', 1400.00, '2 semanas', 'Diseño', TRUE, FALSE, TRUE, NOW(), 'Activo', 'usuario'),

('Luis Martínez', '1234', 'luis@gmail.com', '7456-7890', 'San Miguel', 'Backend Developer',
5, 'APIs y bases de datos.', 'perfil3.jpg', 'portada3.jpg', '', 'https://github.com/luis', '',
'Tiempo completo', 1600.00, 'Inmediata', 'Tecnología', TRUE, TRUE, TRUE, NOW(), 'Activo', 'usuario'),

('María Hernández', '1234', 'maria@gmail.com', '7987-6543', 'La Libertad', 'Project Manager',
6, 'Gestión ágil.', 'perfil4.jpg', 'portada4.jpg', 'https://linkedin.com/maria', '', '',
'Tiempo completo', 1800.00, '1 mes', 'Administración', TRUE, TRUE, FALSE, NOW(), 'Activo', 'usuario'),

('José Ramírez', '1234', 'jose@gmail.com', '7012-3456', 'Sonsonate', 'QA Tester',
2, 'Testing manual y automático.', 'perfil5.jpg', 'portada5.jpg', '', 'https://github.com/jose', '',
'Medio tiempo', 900.00, 'Inmediata', 'Tecnología', TRUE, FALSE, TRUE, NOW(), 'Activo', 'usuario'),

('Sofía Torres', '1234', 'sofia@gmail.com', '7222-3344', 'San Salvador', 'Data Analyst',
3, 'Análisis de datos.', 'perfil6.jpg', 'portada6.jpg', 'https://linkedin.com/sofia', 'https://github.com/sofia', '',
'Remoto', 1500.00, '2 semanas', 'Finanzas', TRUE, TRUE, TRUE, NOW(), 'Activo', 'usuario'),

('Miguel Castro', '1234', 'miguel@gmail.com', '7333-4455', 'Usulután', 'DevOps Engineer',
4, 'CI/CD y automatización.', 'perfil7.jpg', 'portada7.jpg', '', 'https://github.com/miguel', '',
'Tiempo completo', 1700.00, 'Inmediata', 'Tecnología', TRUE, TRUE, TRUE, NOW(), 'Activo', 'usuario'),

('Laura Pérez', '1234', 'laura@gmail.com', '7444-5566', 'Santa Tecla', 'Marketing Digital',
5, 'Marketing online.', 'perfil8.jpg', 'portada8.jpg', 'https://linkedin.com/laura', '', 'https://laura.com',
'Freelance', 1300.00, '1 semana', 'Marketing', TRUE, FALSE, TRUE, NOW(), 'Activo', 'usuario'),

('Andrés Gómez', '1234', 'andres@gmail.com', '7555-6677', 'Chalatenango', 'Soporte Técnico',
2, 'Soporte IT.', 'perfil9.jpg', 'portada9.jpg', '', '', '',
'Tiempo completo', 800.00, 'Inmediata', 'Soporte', TRUE, TRUE, FALSE, NOW(), 'Activo', 'usuario'),

('Daniela Ruiz', '1234', 'daniela@gmail.com', '7666-7788', 'San Vicente', 'Full Stack Developer',
4, 'Frontend y backend.', 'perfil10.jpg', 'portada10.jpg', 'https://linkedin.com/daniela', 'https://github.com/daniela', '',
'Remoto', 1800.00, '2 semanas', 'Tecnología', TRUE, TRUE, TRUE, NOW(), 'Activo', 'usuario'),

('Administrador', '1234', 'admin@shovel.com', '0000-0000', 'San Salvador',
'Administrador del Sistema', 0, 'Cuenta de administración del sistema.', '', '', '', '', '',
'Tiempo completo', 0.00, 'Inmediata', 'Tecnología', FALSE, FALSE, FALSE, NOW(), 'Activo', 'admin');

CREATE TABLE habilidades (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100),
    categoria VARCHAR(100)
);

CREATE TABLE foros_categorias (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100),
    descripcion TEXT,
    icono VARCHAR(255),
    total_discusiones INT
);

CREATE TABLE etiquetas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100)
);

CREATE TABLE empleos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    empresa_id INT NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    responsabilidades TEXT,
    requisitos TEXT,
    requisitos_deseables TEXT,
    beneficios TEXT,
    ubicacion VARCHAR(255),
    tipo_contrato VARCHAR(100),
    nivel_experiencia VARCHAR(100),
    sector VARCHAR(100),
    rango_salarial_min DECIMAL(10,2),
    rango_salarial_max DECIMAL(10,2),
    email_contacto VARCHAR(255),
    estado VARCHAR(50) DEFAULT 'activo',
    total_vistas INT DEFAULT 0,
    total_aplicaciones INT DEFAULT 0,
    fecha_publicacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_cierre DATETIME,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
);

CREATE TABLE valoraciones_empresas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    empresa_id INT NOT NULL,
    calificacion INT CHECK (calificacion BETWEEN 1 AND 5),
    comentario TEXT,
    fecha_valoracion DATETIME DEFAULT CURRENT_TIMESTAMP,
    likes INT DEFAULT 0,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
);
#insercion de empresas prueba
INSERT INTO empresas (nombre, email, contrasena, industria, tamano, ubicacion, descripcion, logo, sitio_web, verificada, calificacion_promedio, total_valoraciones, fecha_registro) VALUES

('TechCorp El Salvador', 'contacto@techcorp.com', '1234', 'Tecnología', '51-200', 'San Salvador', 'Empresa líder en desarrollo de software.', 'techcorp.png', 'https://techcorp.com', TRUE, 4.5, 120, NOW()),

('Diseño Digital SA', 'hola@disenodigital.com', '1234', 'Diseño', '11-50', 'Santa Ana', 'Agencia de diseño UX/UI y branding.', 'diseno.png', 'https://disenodigital.com', TRUE, 4.2, 85, NOW()),

('FinanzasPro', 'info@finanzaspro.com', '1234', 'Finanzas', '201-500', 'San Salvador', 'Consultoría financiera y contable.', 'finanzas.png', 'https://finanzaspro.com', TRUE, 4.0, 60, NOW()),

('MarketingHub', 'equipo@marketinghub.com', '1234', 'Marketing', '11-50', 'San Miguel', 'Agencia de marketing digital y redes sociales.', 'marketing.png', 'https://marketinghub.com', FALSE, 3.8, 45, NOW()),

('DataSolutions', 'datos@datasolutions.com', '1234', 'Tecnología', '51-200', 'Santa Tecla', 'Especialistas en análisis de datos e IA.', 'data.png', 'https://datasolutions.com', TRUE, 4.7, 200, NOW()),

('CloudSoft', 'soporte@cloudsoft.com', '1234', 'Tecnología', '11-50', 'San Salvador', 'Soluciones en la nube y DevOps.', 'cloud.png', 'https://cloudsoft.com', TRUE, 4.3, 95, NOW()),

('EduTech Academy', 'academia@edutech.com', '1234', 'Educación', '11-50', 'Sonsonate', 'Plataforma de educación online y presencial.', 'edutech.png', 'https://edutech.com', FALSE, 4.1, 70, NOW()),

('HealthPlus', 'contacto@healthplus.com', '1234', 'Salud', '201-500', 'La Libertad', 'Red de clínicas y servicios de salud.', 'health.png', 'https://healthplus.com', TRUE, 4.6, 150, NOW()),

('LogisticExpress', 'ops@logisticexpress.com', '1234', 'Logística', '51-200', 'Usulután', 'Empresa de logística y distribución nacional.', 'logistic.png', 'https://logisticexpress.com', FALSE, 3.9, 40, NOW()),

('CreativeStudio', 'hola@creativestudio.com', '1234', 'Diseño', '1-10', 'San Vicente', 'Estudio creativo de fotografía y video.', 'creative.png', 'https://creativestudio.com', FALSE, 4.4, 30, NOW());

-- Empleos de prueba (usan los IDs 1-10 de empresas)
INSERT INTO empleos (empresa_id, titulo, descripcion, responsabilidades, requisitos, ubicacion, tipo_contrato, nivel_experiencia, sector, rango_salarial_min, rango_salarial_max, email_contacto, estado, fecha_publicacion, fecha_cierre) VALUES

(1, 'Senior Frontend Developer', 'Buscamos un desarrollador frontend con experiencia en React y TypeScript.', 'Desarrollar interfaces modernas, colaborar con el equipo de diseño.', 'React, TypeScript, 3+ años de experiencia.', 'San Salvador', 'Tiempo Completo', 'Senior', 'Tecnología', 1500.00, 2500.00, 'rrhh@techcorp.com', 'activo', NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY)),

(1, 'Backend Developer Node.js', 'Desarrollador backend para APIs REST y microservicios.', 'Diseñar e implementar APIs, gestionar bases de datos.', 'Node.js, Express, MySQL, 2+ años.', 'San Salvador', 'Tiempo Completo', 'Mid-Level', 'Tecnología', 1200.00, 2000.00, 'rrhh@techcorp.com', 'activo', NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY)),

(2, 'Diseñador UX/UI', 'Buscamos diseñador con experiencia en Figma y diseño centrado en el usuario.', 'Crear wireframes, prototipos y diseños finales.', 'Figma, Adobe XD, experiencia en UX research.', 'Santa Ana', 'Remoto', 'Mid-Level', 'Diseño', 900.00, 1500.00, 'jobs@disenodigital.com', 'activo', NOW(), DATE_ADD(NOW(), INTERVAL 45 DAY)),

(3, 'Analista Financiero', 'Analista para gestión de portafolios y reportes financieros.', 'Elaborar reportes financieros, análisis de inversiones.', 'Finanzas, Excel avanzado, 3+ años.', 'San Salvador', 'Tiempo Completo', 'Senior', 'Finanzas', 1400.00, 2200.00, 'empleo@finanzaspro.com', 'activo', NOW(), DATE_ADD(NOW(), INTERVAL 20 DAY)),

(4, 'Community Manager', 'Gestión de redes sociales y creación de contenido digital.', 'Crear contenido, gestionar comunidades, analizar métricas.', 'Redes sociales, copywriting, diseño básico.', 'San Miguel', 'Medio Tiempo', 'Junior', 'Marketing', 500.00, 800.00, 'jobs@marketinghub.com', 'activo', NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY)),

(5, 'Data Analyst', 'Analista de datos para proyectos de business intelligence.', 'Analizar datos, crear dashboards, generar insights.', 'Python, SQL, Power BI, 2+ años.', 'Santa Tecla', 'Tiempo Completo', 'Mid-Level', 'Tecnología', 1300.00, 2000.00, 'careers@datasolutions.com', 'activo', NOW(), DATE_ADD(NOW(), INTERVAL 25 DAY)),

(6, 'DevOps Engineer', 'Ingeniero DevOps para automatización y gestión de infraestructura cloud.', 'Gestionar pipelines CI/CD, administrar servidores AWS.', 'Docker, Kubernetes, AWS, 3+ años.', 'San Salvador', 'Remoto', 'Senior', 'Tecnología', 1800.00, 3000.00, 'hr@cloudsoft.com', 'activo', NOW(), DATE_ADD(NOW(), INTERVAL 40 DAY)),

(7, 'Instructor de Programación', 'Docente para cursos de desarrollo web y programación.', 'Impartir clases, crear material didáctico, evaluar estudiantes.', 'Experiencia docente, conocimiento de HTML, CSS, JS.', 'Sonsonate', 'Tiempo Completo', 'Mid-Level', 'Educación', 800.00, 1200.00, 'empleo@edutech.com', 'activo', NOW(), DATE_ADD(NOW(), INTERVAL 15 DAY)),

(8, 'Enfermero/a', 'Personal de enfermería para clínica en La Libertad.', 'Atención a pacientes, administración de medicamentos.', 'Título en enfermería, 1+ años de experiencia.', 'La Libertad', 'Tiempo Completo', 'Junior', 'Salud', 700.00, 1000.00, 'rrhh@healthplus.com', 'activo', NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY)),

(9, 'Coordinador de Logística', 'Coordinador para gestión de rutas y distribución.', 'Planificar rutas, coordinar conductores, gestionar inventario.', 'Logística, Excel, 2+ años de experiencia.', 'Usulután', 'Tiempo Completo', 'Mid-Level', 'Logística', 900.00, 1400.00, 'ops@logisticexpress.com', 'activo', NOW(), DATE_ADD(NOW(), INTERVAL 20 DAY));
CREATE TABLE experiencia_laboral (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    titulo_puesto VARCHAR(255) NOT NULL,
    empresa VARCHAR(255),
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    actualmente_trabajando BOOLEAN DEFAULT FALSE,
    descripcion TEXT,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE alertas_empleo (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT,
    palabras_clave VARCHAR(255),
    ubicacion VARCHAR(255),
    frecuencia VARCHAR(100),
    activa BOOLEAN,
    fecha_creacion DATETIME,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE curriculum_vitae (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    archivo_url VARCHAR(255) NOT NULL,
    nombre_archivo VARCHAR(255),
    fecha_subida DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    principal BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE notificaciones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    tipo VARCHAR(100),
    titulo VARCHAR(255) NOT NULL,
    mensaje TEXT,
    leida BOOLEAN DEFAULT FALSE,
    url_accion VARCHAR(255),
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE usuario_habilidades (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    habilidad_id INT NOT NULL,
    nivel INT CHECK (nivel BETWEEN 1 AND 5),
    UNIQUE (usuario_id, habilidad_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (habilidad_id) REFERENCES habilidades(id)
);

CREATE TABLE discusiones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    categoria_id INT NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    contenido TEXT,
    destacado BOOLEAN DEFAULT FALSE,
    total_respuestas INT DEFAULT 0,
    total_likes INT DEFAULT 0,
    total_vistas INT DEFAULT 0,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (categoria_id) REFERENCES foros_categorias(id)
);

CREATE TABLE postulaciones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    empleo_id INT NOT NULL,
    estado VARCHAR(50) DEFAULT 'pendiente',
    cv_url VARCHAR(255),
    carta_presentacion TEXT,
    fecha_aplicacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE (usuario_id, empleo_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (empleo_id) REFERENCES empleos(id)
);

CREATE TABLE empleos_guardados (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    empleo_id INT NOT NULL,
    fecha_guardado DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (usuario_id, empleo_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (empleo_id) REFERENCES empleos(id)
);

CREATE TABLE respuestas_foro (
    id INT PRIMARY KEY AUTO_INCREMENT,
    discusion_id INT NOT NULL,
    usuario_id INT NOT NULL,
    contenido TEXT NOT NULL,
    total_likes INT DEFAULT 0,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (discusion_id) REFERENCES discusiones(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE discusion_etiquetas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    discusion_id INT NOT NULL,
    etiqueta_id INT NOT NULL,
    UNIQUE (discusion_id, etiqueta_id),
    FOREIGN KEY (discusion_id) REFERENCES discusiones(id),
    FOREIGN KEY (etiqueta_id) REFERENCES etiquetas(id)
);


INSERT INTO foros_categorias (nombre, descripcion, icono, total_discusiones) VALUES
('Tecnología',          'Programación, software, herramientas y tendencias tech',      'code',        89),
('Marketing',           'Marketing digital, publicidad, branding y estrategias',       'trending-up', 45),
('Diseño',              'UX/UI, diseño gráfico, herramientas y portafolios',           'pen-tool',    38),
('Finanzas',            'Salarios, negociaciones, inversión y economía laboral',       'dollar-sign', 32),
('Recursos Humanos',    'Procesos de selección, cultura empresarial y bienestar',      'users',       41),
('Carrera Profesional', 'Desarrollo profesional, transiciones de carrera y consejos', 'briefcase',   22);

INSERT INTO etiquetas (nombre) VALUES
('Salario'), ('Negociación'), ('Carrera'), ('Desarrollo Web'), ('Aprendizaje'),
('Soft Skills'), ('Empleabilidad'), ('Freelance'), ('Marketing Digital'), ('Estrategia'),
('Entrevistas'), ('Remoto'), ('Internacional'), ('Habilidades'), ('Productividad'),
('Liderazgo'), ('React'), ('Node.js'), ('UX'), ('Portfolio');

INSERT INTO discusiones (usuario_id, categoria_id, titulo, contenido, destacado, total_respuestas, total_likes, total_vistas, fecha_creacion) VALUES
(2, 4, '¿Cuál es el mejor momento para negociar un aumento de sueldo?',
'He estado trabajando en mi empresa actual por 2 años y siento que es momento de solicitar un aumento. He superado mis objetivos este año y he asumido responsabilidades adicionales.\n\nMi pregunta es: ¿cuál consideran que es el mejor momento para negociar? ¿Debo esperar a la revisión anual o es mejor hacerlo cuando termino un proyecto importante?\n\nTambién me gustaría saber qué argumentos han funcionado mejor en sus experiencias. ¿Se enfocan en logros, comparación con el mercado, o ambos?\n\nCualquier consejo será muy apreciado. ¡Gracias!',
TRUE, 3, 56, 320, '2026-04-11 08:00:00'),

(1, 1, 'Consejos para transición de carrera a desarrollo web',
'Llevo 5 años en administración y quiero hacer el salto al desarrollo web. He estado aprendiendo HTML, CSS y JavaScript por mi cuenta durante 6 meses.\n\n¿Cuánto tiempo realista necesito para estar listo para mi primer trabajo? ¿Qué stack recomiendan para conseguir empleo más rápido?\n\nAgradezco cualquier experiencia o consejo de quienes ya hicieron esta transición.',
FALSE, 1, 42, 280, '2026-04-11 05:00:00'),

(8, 5, '¿Qué habilidades blandas son más valoradas por los empleadores?',
'Estoy preparando mi perfil profesional y me pregunto cuáles son las soft skills que realmente marcan la diferencia al momento de contratar.\n\n¿Qué opinan desde la perspectiva de quienes contratan y también de quienes han sido contratados recientemente?',
FALSE, 0, 78, 450, '2026-04-10 10:00:00'),

(8, 2, 'Estrategias de marketing digital para freelancers',
'Llevo 1 año como freelancer de diseño y me cuesta conseguir clientes de forma constante. Actualmente uso solo Instagram y referencias de conocidos.\n\n¿Qué estrategias de marketing digital han funcionado mejor para ustedes como freelancers?',
FALSE, 0, 35, 190, '2026-04-10 08:00:00'),

(7, 1, 'Experiencias con entrevistas remotas en empresas internacionales',
'He tenido varias entrevistas con empresas de EE.UU. y Europa y noto diferencias importantes con las entrevistas locales.\n\n¿Alguien más ha pasado por este proceso? Me gustaría saber cómo prepararse para los desafíos técnicos en inglés y cómo manejar las diferencias culturales.',
TRUE, 2, 92, 520, '2026-04-08 12:00:00'),

(4, 6, '¿Cómo armar un portafolio si no tengo experiencia laboral?',
'Acabo de terminar mis estudios de diseño gráfico y no tengo experiencia formal. Todos los trabajos piden portafolio pero ¿cómo construyo uno sin haber trabajado?\n\n¿Proyectos personales cuentan? ¿Trabajos universitarios? Busco consejos prácticos.',
FALSE, 0, 44, 210, '2026-04-09 14:00:00'),

(3, 1, 'Docker vs máquinas virtuales: ¿cuándo usar cada uno?',
'Estoy aprendiendo sobre infraestructura y me genera confusión saber cuándo conviene usar Docker y cuándo una VM tradicional.\n\n¿Alguien con experiencia en DevOps puede explicar los casos de uso reales de cada uno?',
FALSE, 0, 29, 175, '2026-04-09 09:00:00'),

(2, 3, 'Figma vs Adobe XD en 2026: ¿cuál recomiendan?',
'Soy diseñadora y quiero dominar bien una sola herramienta. He probado ambas superficialmente.\n\n¿Cuál tiene mejor futuro laboral? ¿Cuál es más pedida por las empresas actualmente?',
FALSE, 0, 51, 300, '2026-04-07 16:00:00');

INSERT INTO discusion_etiquetas (discusion_id, etiqueta_id) VALUES
(1, 1), (1, 2), (1, 3),
(2, 4), (2, 3), (2, 5),
(3, 6), (3, 14), (3, 7),
(4, 8), (4, 9), (4, 10),
(5, 11), (5, 12), (5, 13),
(6, 20), (6, 3), (6, 19),
(7, 18), (7, 15),
(8, 19), (8, 20);

INSERT INTO respuestas_foro (discusion_id, usuario_id, contenido, total_likes, fecha_creacion) VALUES
(1, 1, 'Excelente pregunta. En mi experiencia, el mejor momento es después de completar un proyecto importante o cuando has logrado algo significativo.\n\nAlgunos consejos:\n- Prepara números concretos de tus logros\n- Investiga el rango salarial del mercado para tu posición\n- Ten una cifra específica en mente, no un rango\n- Sé profesional y enfócate en valor, no en necesidad personal\n\n¡Mucha suerte!',
15, '2026-04-11 09:15:00'),

(1, 4, 'Totalmente de acuerdo. Además recomiendo:\n\n- No hagas la solicitud por email, hazlo en persona\n- Escoge un momento en que tu jefe no esté estresado\n- Ten un plan B: si no pueden aumentar salario, tal vez bonos o capacitación\n- Sé paciente, estas cosas toman tiempo\n\nEn mi caso, esperé 3 semanas después de liderar un proyecto exitoso y funcionó perfectamente.',
12, '2026-04-11 10:30:00'),

(1, 3, 'Una cosa que me ayudó mucho fue documentar todo lo que hice durante el año. Mantuve un archivo con todos mis logros, proyectos completados y feedback positivo.\n\nCuando llegó el momento de la negociación, tenía todo organizado y fue mucho más fácil presentar mi caso.',
8, '2026-04-11 11:45:00'),

(2, 10, 'Hice exactamente eso hace 2 años. Mi recomendación es enfocarte en React después de dominar los fundamentos. Con 12-18 meses de práctica constante puedes conseguir tu primer trabajo.\n\nLo más importante: construye proyectos reales y sube todo a GitHub.',
23, '2026-04-11 06:30:00'),

(5, 10, 'Tengo experiencia trabajando remoto para una empresa de otro país. El mayor consejo: practica hablar en inglés técnico todos los días, no solo leerlo.\n\nPara el proceso técnico, LeetCode y HackerRank son esenciales. Las empresas internacionales suelen tener 3-5 rondas de entrevistas.',
41, '2026-04-08 14:00:00'),

(5, 7, 'Añado que es muy importante investigar la cultura de la empresa antes. Las empresas de EE.UU. valoran mucho el storytelling con el método STAR para responder preguntas de comportamiento.',
29, '2026-04-09 09:00:00');

SET SQL_SAFE_UPDATES = 0;
UPDATE foros_categorias fc
SET total_discusiones = (
    SELECT COUNT(*) FROM discusiones d WHERE d.categoria_id = fc.id
);
UPDATE discusiones SET total_likes = 0;
UPDATE respuestas_foro SET total_likes = 0;
SET SQL_SAFE_UPDATES = 1;

UPDATE discusiones SET total_vistas = 0 WHERE id > 0;

#cosas que me faltaron de agregar a empleos
UPDATE empleos SET
    requisitos_deseables = 'Experiencia con Next.js, conocimiento de GraphQL, inglés intermedio.',
    beneficios = 'Seguro médico, trabajo remoto 2 días por semana, capacitaciones pagadas, bonos por desempeño.'
WHERE id = 1;

UPDATE empleos SET
    requisitos_deseables = 'Experiencia con microservicios, conocimiento de AWS, inglés básico.',
    beneficios = 'Seguro médico, horario flexible, bonos trimestrales, acceso a cursos online.'
WHERE id = 2;

UPDATE empleos SET
    requisitos_deseables = 'Experiencia en motion design, conocimiento de HTML y CSS básico.',
    beneficios = 'Trabajo 100% remoto, equipo de trabajo proporcionado, bonos por proyecto.'
WHERE id = 3;

UPDATE empleos SET
    requisitos_deseables = 'Manejo de Bloomberg, inglés avanzado, MBA.',
    beneficios = 'Seguro médico y dental, vehículo de empresa, bonos anuales.'
WHERE id = 4;

UPDATE empleos SET
    requisitos_deseables = 'Conocimiento de fotografía básica, experiencia con Meta Ads.',
    beneficios = 'Horario flexible, trabajo híbrido, acceso a herramientas premium.'
WHERE id = 5;

UPDATE empleos SET
    requisitos_deseables = 'Experiencia con machine learning, conocimiento de R, inglés intermedio.',
    beneficios = 'Trabajo remoto, seguro médico, bonos por desempeño, presupuesto para capacitaciones.'
WHERE id = 6;

UPDATE empleos SET
    requisitos_deseables = 'Certificación AWS, experiencia con Terraform, inglés avanzado.',
    beneficios = 'Trabajo 100% remoto, equipo proporcionado, seguro médico internacional, bonos en dólares.'
WHERE id = 7;

UPDATE empleos SET
    requisitos_deseables = 'Experiencia con plataformas LMS, conocimiento de Python.',
    beneficios = 'Horario flexible, prestaciones de ley, descuentos en cursos para familiares.'
WHERE id = 8;

UPDATE empleos SET
    requisitos_deseables = 'Especialidad en cuidados intensivos, inglés básico.',
    beneficios = 'Seguro médico, uniformes proporcionados, prestaciones de ley completas.'
WHERE id = 9;

UPDATE empleos SET
    requisitos_deseables = 'Licencia de conducir categoría pesada, conocimiento de GPS y software logístico.',
    beneficios = 'Vehículo de empresa, seguro médico, bonos por eficiencia.'
WHERE id = 10;


Drop table recursos;

CREATE TABLE recursos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(255) NOT NULL,
    tipo ENUM('documento', 'video', 'articulo', 'infografia', 'podcast') NOT NULL,
    categoria VARCHAR(100),
    contenido TEXT,
    autor_id INT,                          
    empresa_id INT,                        
    archivo_url VARCHAR(255),              
    video_url VARCHAR(255),                
    thumbnail_url VARCHAR(255),            
    duracion_segundos INT,                 
    tamano_archivo INT,                    
    formato VARCHAR(50),                   
    tiempo_lectura INT,                    
    total_vistas INT DEFAULT 0,
    total_descargas INT DEFAULT 0,         
    total_likes INT DEFAULT 0,
    es_premium BOOLEAN DEFAULT FALSE,      
    estado VARCHAR(50) DEFAULT 'activo',
    sector VARCHAR(100),                   
    fecha_publicacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (autor_id) REFERENCES usuarios(id),
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
);





SET SQL_SAFE_UPDATES = 0;

DELETE FROM usuarios WHERE id != 11;

SET SQL_SAFE_UPDATES = 1;


SET SQL_SAFE_UPDATES = 0;
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE postulaciones;
TRUNCATE TABLE empleos_guardados;
TRUNCATE TABLE empleos;
TRUNCATE TABLE valoraciones_empresas;
TRUNCATE TABLE empresas;

SET FOREIGN_KEY_CHECKS = 1;
SET SQL_SAFE_UPDATES = 1;