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


