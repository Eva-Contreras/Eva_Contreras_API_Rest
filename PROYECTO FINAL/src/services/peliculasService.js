import conexion from '../database/conexion.js';

export async function listarPeliculas({ titulo, director, anio }) {
    const condiciones = [];
    const valores = [];

    if (titulo) {
        condiciones.push('LOCATE(LOWER(?), LOWER(titulo) COLLATE utf8mb4_bin) > 0');
        valores.push(titulo);
    }

    if (director) {
        condiciones.push('LOCATE(LOWER(?), LOWER(director) COLLATE utf8mb4_bin) > 0');
        valores.push(director);
    }

    if (anio) {
        const anioNumerico = parseInt(anio, 10);
        if (Number.isNaN(anioNumerico)) {
            return [];
        }
        condiciones.push('anio = ?');
        valores.push(anioNumerico);
    }

    const filtro = condiciones.length ? ` WHERE ${condiciones.join(' AND ')}` : '';
    const [peliculas] = await conexion.execute(
        `SELECT id, titulo, director, anio FROM peliculas${filtro} ORDER BY id`,
        valores
    );
    return peliculas;
}

export async function buscarPelicula(id) {
    const [peliculas] = await conexion.execute(
        'SELECT id, titulo, director, anio FROM peliculas WHERE id = ?',
        [id]
    );
    return peliculas[0];
}

export async function crearPelicula({ titulo, director, anio }) {
    const [resultado] = await conexion.execute(
        'INSERT INTO peliculas (titulo, director, anio) VALUES (?, ?, ?)',
        [titulo, director, anio]
    );
    return { id: resultado.insertId, titulo, director, anio };
}

export async function actualizarPelicula(id, { titulo, director, anio }) {
    const [resultado] = await conexion.execute(
        'UPDATE peliculas SET titulo = ?, director = ?, anio = ? WHERE id = ?',
        [titulo, director, anio, id]
    );
    return resultado.affectedRows ? { id, titulo, director, anio } : null;
}

export async function eliminarPelicula(id) {
    const [resultado] = await conexion.execute(
        'DELETE FROM peliculas WHERE id = ?',
        [id]
    );
    return resultado.affectedRows > 0;
}
