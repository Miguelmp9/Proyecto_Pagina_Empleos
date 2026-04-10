drop database shovel;
create database shovel;
use shovel; #uso de la base
# select * from (para que prueben si se agregaron los datos)

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
3, 'Frontend y React.', 'perfil1.jpg', 'portada1.jpg',
'', 'https://github.com/carlos', '',
'Tiempo completo', 1200.00, 'Inmediata', 'Tecnología',
TRUE, TRUE, TRUE, NOW(), 'Activo', 'usuario'),

('Ana López', '1234', 'ana@gmail.com', '7123-4567', 'Santa Ana', 'Diseñadora UX/UI',
4, 'Diseño centrado en usuario.', 'perfil2.jpg', 'portada2.jpg',
'https://linkedin.com/ana', '', '',
'Remoto', 1400.00, '2 semanas', 'Diseño',
TRUE, FALSE, TRUE, NOW(), 'Activo', 'usuario'),

('Luis Martínez', '1234', 'luis@gmail.com', '7456-7890', 'San Miguel', 'Backend Developer',
5, 'APIs y bases de datos.', 'perfil3.jpg', 'portada3.jpg',
'', 'https://github.com/luis', '',
'Tiempo completo', 1600.00, 'Inmediata', 'Tecnología',
TRUE, TRUE, TRUE, NOW(), 'Activo', 'usuario'),

('María Hernández', '1234', 'maria@gmail.com', '7987-6543', 'La Libertad', 'Project Manager',
6, 'Gestión ágil.', 'perfil4.jpg', 'portada4.jpg',
'https://linkedin.com/maria', '', '',
'Tiempo completo', 1800.00, '1 mes', 'Administración',
TRUE, TRUE, FALSE, NOW(), 'Activo', 'usuario'),

('José Ramírez', '1234', 'jose@gmail.com', '7012-3456', 'Sonsonate', 'QA Tester',
2, 'Testing manual y automático.', 'perfil5.jpg', 'portada5.jpg',
'', 'https://github.com/jose', '',
'Medio tiempo', 900.00, 'Inmediata', 'Tecnología',
TRUE, FALSE, TRUE, NOW(), 'Activo', 'usuario'),

('Sofía Torres', '1234', 'sofia@gmail.com', '7222-3344', 'San Salvador', 'Data Analyst',
3, 'Análisis de datos.', 'perfil6.jpg', 'portada6.jpg',
'https://linkedin.com/sofia', 'https://github.com/sofia', '',
'Remoto', 1500.00, '2 semanas', 'Finanzas',
TRUE, TRUE, TRUE, NOW(), 'Activo', 'usuario'),

('Miguel Castro', '1234', 'miguel@gmail.com', '7333-4455', 'Usulután', 'DevOps Engineer',
4, 'CI/CD y automatización.', 'perfil7.jpg', 'portada7.jpg',
'', 'https://github.com/miguel', '',
'Tiempo completo', 1700.00, 'Inmediata', 'Tecnología',
TRUE, TRUE, TRUE, NOW(), 'Activo', 'usuario'),

('Laura Pérez', '1234', 'laura@gmail.com', '7444-5566', 'Santa Tecla', 'Marketing Digital',
5, 'Marketing online.', 'perfil8.jpg', 'portada8.jpg',
'https://linkedin.com/laura', '', 'https://laura.com',
'Freelance', 1300.00, '1 semana', 'Marketing',
TRUE, FALSE, TRUE, NOW(), 'Activo', 'usuario'),

('Andrés Gómez', '1234', 'andres@gmail.com', '7555-6677', 'Chalatenango', 'Soporte Técnico',
2, 'Soporte IT.', 'perfil9.jpg', 'portada9.jpg',
'', '', '',
'Tiempo completo', 800.00, 'Inmediata', 'Soporte',
TRUE, TRUE, FALSE, NOW(), 'Activo', 'usuario'),

('Daniela Ruiz', '1234', 'daniela@gmail.com', '7666-7788', 'San Vicente', 'Full Stack Developer',
4, 'Frontend y backend.', 'perfil10.jpg', 'portada10.jpg',
'https://linkedin.com/daniela', 'https://github.com/daniela', '',
'Remoto', 1800.00, '2 semanas', 'Tecnología',
TRUE, TRUE, TRUE, NOW(), 'Activo', 'usuario'),

('Administrador', '1234', 'admin@shovel.com', '0000-0000', 'San Salvador',
'Administrador del Sistema', 0, 'Cuenta de administración del sistema.',
'', '', '', '', '',
'Tiempo completo', 0.00, 'Inmediata', 'Tecnología',
FALSE, FALSE, FALSE, NOW(), 'Activo', 'admin');

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


INSERT INTO empresas (nombre, industria, tamano, ubicacion, descripcion, logo, sitio_web, verificada, calificacion_promedio, total_valoraciones, fecha_registro) VALUES
('TechSolutions SV', 'Tecnología', '50-200 empleados', 'San Salvador', 'Desarrollo de software y soluciones digitales para empresas en El Salvador y Centroamérica.', 'logo_tech.png', 'https://techsolutions.sv', TRUE, 4.5, 28, NOW()),
('Creativa Digital', 'Diseño', '10-50 empleados', 'Santa Tecla', 'Agencia especializada en diseño UX/UI, branding y marketing digital.', 'logo_creativa.png', 'https://creativadigital.com', TRUE, 4.8, 42, NOW()),
('DataCorp El Salvador', 'Finanzas', '200-500 empleados', 'San Salvador', 'Análisis de datos, business intelligence y consultoría financiera.', 'logo_datacorp.png', 'https://datacorp.sv', FALSE, 4.2, 15, NOW()),
('StartUp Innovadora', 'Tecnología', '1-10 empleados', 'Remoto', 'Startup enfocada en inteligencia artificial y automatización de procesos.', 'logo_startup.png', 'https://startup-innova.io', FALSE, 4.0, 8, NOW()),
('Consultores Asociados', 'Administración', '50-200 empleados', 'San Miguel', 'Consultoría empresarial, gestión de proyectos y transformación digital.', 'logo_consultores.png', 'https://consultores-asoc.com', TRUE, 4.3, 31, NOW()),
('Banco Central de Reservas', 'Finanzas', '500+ empleados', 'San Salvador', 'Institución financiera gubernamental.', 'logo_bcr.png', 'https://bcr.gob.sv', TRUE, 4.1, 120, NOW()),
('Clínicas de El Salvador', 'Salud', '200-500 empleados', 'San Salvador', 'Red de centros médicos especializados.', 'logo_clinicas.png', 'https://clinicas.sv', TRUE, 4.4, 89, NOW()),
('EducaOnline SV', 'Educación', '10-50 empleados', 'Remoto', 'Plataforma de educación en línea para Centroamérica.', 'logo_educa.png', 'https://educaonline.sv', FALSE, 4.6, 55, NOW());



INSERT INTO empleos (empresa_id, titulo, descripcion, responsabilidades, requisitos, beneficios, ubicacion, tipo_contrato, nivel_experiencia, sector, rango_salarial_min, rango_salarial_max, email_contacto, estado, fecha_publicacion, fecha_cierre) VALUES

-- TechSolutions SV (empresa_id = 1)
(1, 'Desarrollador Frontend React', 
 'Buscamos desarrollador con experiencia en React para unirse a nuestro equipo de desarrollo.', 
 '• Desarrollar interfaces con React y TypeScript\n• Colaborar con el equipo de diseño UX\n• Optimizar rendimiento y accesibilidad\n• Participar en code reviews', 
 '• 2+ años de experiencia en React\n• Conocimiento sólido en TypeScript\n• Experiencia con Git y trabajo en equipo\n• Inglés técnico (lectura)', 
 '• Salario competitivo en USD\n• Trabajo híbrido (3 días oficina, 2 remoto)\n• Capacitaciones certificadas pagadas\n• Seguro médico privado', 
 'San Salvador', 'Tiempo completo', 'Mid-Level', 'Tecnología', 
 800.00, 1500.00, 'rrhh@techsolutions.sv', 'activo', NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY)),

(1, 'Backend Developer Node.js', 
 'Desarrollador backend para crear y mantener APIs escalables con Node.js y MySQL.', 
 '• Diseñar y desarrollar APIs RESTful\n• Optimizar consultas y estructura de base de datos\n• Implementar autenticación y seguridad\n• Documentar endpoints con Swagger', 
 '• 3+ años de experiencia en Node.js\n• Experiencia con MySQL o PostgreSQL\n• Conocimiento en Docker y CI/CD\n• Buenas prácticas de código limpio', 
 '• Experiencia con microservicios\n• Conocimiento en AWS o Azure', 
 '• Bonus trimestral por desempeño\n• Seguro médico familiar\n• Home office 2 días/semana\n• Presupuesto para conferencias', 
 'San Salvador', 'Tiempo completo', 'Senior', 'Tecnología', 
 1200.00, 2000.00, 'rrhh@techsolutions.sv', 'activo', NOW(), DATE_ADD(NOW(), INTERVAL 45 DAY)),

(1, 'Practicante de Desarrollo Web', 
 'Oportunidad para estudiantes de último año en sistemas, informática o carreras afines.', 
 '• Apoyar en desarrollo de módulos frontend/backend\n• Escribir pruebas unitarias básicas\n• Documentar código y procesos\n• Participar en reuniones de equipo', 
 '• Conocimientos en HTML, CSS y JavaScript\n• Git básico (commit, push, pull)\n• Ganas de aprender y crecer profesionalmente\n• Disponibilidad de 20-30 horas/semana', 
 '• Estar cursando último año de carrera técnica/universitaria\n• Portfolio con proyectos personales (aunque sean pequeños)', 
 '• Mentoría personalizada con desarrolladores senior\n• Posibilidad de contratación al finalizar prácticas\n• Certificado de prácticas profesionales\n• Ambiente de aprendizaje', 
 'San Salvador', 'Prácticas', 'Entry-Level', 'Tecnología', 
 300.00, 500.00, 'practicas@techsolutions.sv', 'activo', NOW(), DATE_ADD(NOW(), INTERVAL 15 DAY)),

-- Creativa Digital (empresa_id = 2)
(2, 'Diseñador UX/UI Junior', 
 'Únete a nuestro equipo creativo para diseñar experiencias digitales memorables.', 
 '• Crear wireframes, mockups y prototipos en Figma\n• Realizar tests de usabilidad con usuarios reales\n• Colaborar estrechamente con desarrolladores frontend\n• Mantener y actualizar sistema de diseño', 
 '• Portfolio con al menos 3 proyectos UX/UI completos\n• Dominio de Figma (auto-layout, componentes, variables)\n• Inglés básico para documentación técnica\n• Capacidad de recibir y aplicar feedback', 
 '• Conocimiento básico de HTML/CSS\n• Experiencia con herramientas de prototipado interactivo', 
 '• Ambiente creativo y colaborativo\n• Flexibilidad horaria (núcleo 10am-3pm)\n• Proyectos con clientes internacionales\n• Presupuesto para cursos de diseño', 
 'Santa Tecla', 'Tiempo completo', 'Junior', 'Diseño', 
 600.00, 900.00, 'hola@creativadigital.com', 'activo', NOW(), DATE_ADD(NOW(), INTERVAL 20 DAY)),

(2, 'Especialista en Marketing Digital', 
 'Profesional para planificar y ejecutar campañas digitales efectivas.', 
 '• Planificar estrategias de marketing en redes sociales y Google Ads\n• Gestionar presupuesto mensual de anuncios ($5k-$20k)\n• Analizar métricas, ROI y generar reportes ejecutivos\n• Coordinar con equipo de diseño para creatividades', 
 '• 2+ años gestionando campañas en Google Ads y Meta Ads\n• Conocimiento sólido en SEO on-page y técnico\n• Google Analytics 4 certificado\n• Excel intermedio (tablas dinámicas, fórmulas)', 
 '• Experiencia en e-commerce o SaaS\n• Conocimiento de herramientas de automatización (HubSpot, Mailchimp)', 
 '• Comisiones por resultados alcanzados\n• Capacitaciones pagadas en plataformas premium\n• Ambiente dinámico y sin burocracia\n• Día libre en cumpleaños', 
 'Santa Tecla', 'Tiempo completo', 'Mid-Level', 'Marketing', 
 700.00, 1200.00, 'hola@creativadigital.com', 'activo', NOW(), DATE_ADD(NOW(), INTERVAL 25 DAY)),

-- DataCorp El Salvador (empresa_id = 3)
(3, 'Analista de Datos', 
 'Profesional para transformar datos en insights accionables para la toma de decisiones.', 
 '• Procesar y limpiar grandes volúmenes de datos financieros\n• Crear dashboards interactivos en Power BI o Tableau\n• Desarrollar modelos predictivos básicos\n• Presentar hallazgos a gerencia y stakeholders', 
 '• Experiencia comprobable en SQL y Python (pandas, numpy)\n• Conocimiento en estadística descriptiva e inferencial\n• Dominio de Power BI o Tableau\n• Capacidad de comunicación técnica y no técnica', 
 '• Experiencia en sector financiero o bancario\n• Conocimiento de machine learning básico (scikit-learn)', 
 '• Bonos trimestrales por objetivos cumplidos\n• Capacitación certificada en herramientas cloud (AWS, Azure)\n• Plan de carrera estructurado\n• Seguro médico con cobertura familiar', 
 'San Salvador', 'Tiempo completo', 'Mid-Level', 'Finanzas', 
 1000.00, 1600.00, 'talento@datacorp.sv', 'activo', NOW(), DATE_ADD(NOW(), INTERVAL 60 DAY)),

-- StartUp Innovadora (empresa_id = 4)
(4, 'Full Stack Developer Remoto', 
 'Startup en crecimiento busca desarrollador full stack para proyecto innovador con IA.', 
 '• Desarrollar features tanto en frontend (React) como backend (Node.js)\n• Integrar APIs de inteligencia artificial (OpenAI, Anthropic)\n• Participar en decisiones de arquitectura y tecnología\n• Escribir código limpio, testeable y documentado', 
 '• Experiencia sólida en React + Node.js en producción\n• Conocimiento en APIs REST y GraphQL\n• Mentalidad startup: autonomía, proactividad, aprendizaje continuo\n• Inglés intermedio para documentación y reuniones', 
 '• Experiencia con herramientas de IA generativa\n• Conocimiento en despliegue en Vercel/Render/Railway', 
 '• Equity (acciones) en la startup\n• 100% remoto con horario flexible\n• Tecnología de punta y libertad técnica\n• Presupuesto anual para equipo y herramientas', 
 'Remoto', 'Tiempo completo', 'Mid-Level', 'Tecnología', 
 1300.00, 2200.00, 'jobs@startup-innova.io', 'activo', NOW(), DATE_ADD(NOW(), INTERVAL 90 DAY)),

-- Consultores Asociados (empresa_id = 5)
(5, 'Project Manager', 
 'Liderar proyectos de transformación digital para clientes corporativos del sector público y privado.', 
 '• Gestionar cronogramas, presupuestos y alcance de proyectos\n• Coordinar equipos multidisciplinarios (desarrollo, diseño, QA)\n• Reportar avances y riesgos a stakeholders ejecutivos\n• Aplicar metodologías ágiles (Scrum, Kanban) según contexto', 
 '• Certificación PMP, Scrum Master o equivalente\n• 4+ años gestionando proyectos de TI o consultoría\n• Excel avanzado y herramientas de gestión (Jira, Asana, MS Project)\n• Excelentes habilidades de comunicación y negociación', 
 '• Experiencia en sector público o banca\n• Conocimiento en gestión del cambio organizacional', 
 '• Auto de empresa o bono de transporte\n• Seguro médico familiar con cobertura amplia\n• Bonus anual por proyecto entregado\n• Capacitación en metodologías avanzadas', 
 'San Miguel', 'Tiempo completo', 'Senior', 'Administración', 
 1500.00, 2500.00, 'rrhh@consultores-asoc.com', 'activo', NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY)),

-- Banco Central de Reservas (empresa_id = 6)
(6, 'Desarrollador Java Senior', 
 'Desarrollador para sistemas críticos del sector financiero gubernamental.', 
 '• Desarrollar y mantener aplicaciones Java enterprise\n• Implementar estándares de seguridad bancaria\n• Optimizar rendimiento de sistemas de alta disponibilidad\n• Documentar procesos técnicos para auditoría', 
 '• 5+ años en Java EE/Spring Boot\n• Experiencia con bases de datos Oracle o PostgreSQL\n• Conocimiento en seguridad informática y normativas financieras\n• Disponibilidad para guardias técnicas rotativas', 
 '• Certificaciones Oracle o Spring\n• Experiencia en sector bancario o gubernamental', 
 '• Salario competitivo del sector público\n• Prestaciones de ley ampliadas\n• Estabilidad laboral y plan de pensiones\n• Capacitación técnica continua', 
 'San Salvador', 'Tiempo completo', 'Senior', 'Finanzas', 
 1400.00, 2100.00, 'recursos.humanos@bcr.gob.sv', 'activo', NOW(), DATE_ADD(NOW(), INTERVAL 40 DAY)),

-- Clínicas de El Salvador (empresa_id = 7)
(7, 'Enfermero/a de Planta', 
 'Profesional de enfermería para atención en áreas de hospitalización y emergencia.', 
 '• Brindar atención directa a pacientes según protocolos\n• Administrar medicamentos y tratamientos prescritos\n• Registrar información clínica en sistema electrónico\n• Coordinar con equipo médico multidisciplinario', 
 '• Título universitario en Enfermería registrado en CNS\n• 2+ años de experiencia en entorno hospitalario\n• Certificación en RCP y primeros auxilios vigente\n• Disponibilidad para turnos rotativos', 
 '• Especialización en área crítica o quirúrgica\n• Conocimiento de sistemas de historia clínica electrónica', 
 '• Salario base + bonos por turno nocturno/festivo\n• Seguro médico para empleado y familia directa\n• Capacitación continua en áreas clínicas\n• Oportunidades de especialización pagada', 
 'San Salvador', 'Tiempo completo', 'Mid-Level', 'Salud', 
 650.00, 950.00, 'talento@clinicas.sv', 'activo', NOW(), DATE_ADD(NOW(), INTERVAL 35 DAY)),

-- EducaOnline SV (empresa_id = 8)
(8, 'Desarrollador de Contenido Educativo', 
 'Crear materiales didácticos digitales para cursos en línea de calidad.', 
 '• Diseñar estructuras de cursos y módulos de aprendizaje\n• Redactar contenidos pedagógicos atractivos y efectivos\n• Coordinar con diseñadores instruccionales y multimedia\n• Evaluar y actualizar contenidos según feedback de estudiantes', 
 '• Experiencia en diseño instruccional o creación de contenido educativo\n• Conocimiento de plataformas LMS (Moodle, Canvas, Teachable)\n• Excelentes habilidades de redacción y ortografía\n• Creatividad y empatía con el estudiante adulto', 
 '• Experiencia en educación en línea para Centroamérica\n• Conocimiento de estándares SCORM o xAPI', 
 '• 100% remoto con horario flexible\n• Pago por proyecto o mensual según acuerdo\n• Acceso gratuito a toda la plataforma educativa\n• Reconocimiento público como autor/a de cursos', 
 'Remoto', 'Medio tiempo', 'Mid-Level', 'Educación', 
 500.00, 800.00, 'contenido@educaonline.sv', 'activo', NOW(), DATE_ADD(NOW(), INTERVAL 50 DAY));


INSERT INTO habilidades (nombre, categoria) VALUES
('React', 'Frontend'), ('TypeScript', 'Frontend'), ('JavaScript', 'Frontend'), ('HTML/CSS', 'Frontend'),
('Node.js', 'Backend'), ('Python', 'Backend'), ('Java', 'Backend'), ('SQL', 'Backend'),
('MySQL', 'Base de Datos'), ('PostgreSQL', 'Base de Datos'), ('MongoDB', 'Base de Datos'),
('Figma', 'Diseño'), ('Adobe XD', 'Diseño'), ('Photoshop', 'Diseño'),
('Scrum', 'Metodologías'), ('Kanban', 'Metodologías'), ('Git', 'Herramientas'), ('Docker', 'Herramientas'),
('AWS', 'Cloud'), ('Azure', 'Cloud'), ('Google Analytics', 'Marketing'), ('SEO', 'Marketing');


CREATE INDEX idx_empleos_titulo ON empleos(titulo);
CREATE INDEX idx_empleos_sector ON empleos(sector);
CREATE INDEX idx_empleos_ubicacion ON empleos(ubicacion);
CREATE INDEX idx_empleos_contrato ON empleos(tipo_contrato);
CREATE INDEX idx_empleos_nivel ON empleos(nivel_experiencia);
CREATE INDEX idx_empleos_salario ON empleos(rango_salarial_min, rango_salarial_max);
CREATE INDEX idx_empleos_estado_fecha ON empleos(estado, fecha_publicacion);
CREATE INDEX idx_empresas_nombre ON empresas(nombre);
CREATE INDEX idx_usuarios_email ON usuarios(email);


SELECT '✅ Total Empresas:' AS estado, COUNT(*) as total FROM empresas;
SELECT '✅ Total Empleos:' AS estado, COUNT(*) as total FROM empleos;
SELECT '✅ Empleos Activos:' AS estado, COUNT(*) as total FROM empleos WHERE estado = 'activo';

