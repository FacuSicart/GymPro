# Inicio local para pruebas

Guia para volver a levantar el proyecto despues de apagar o reiniciar la PC.

## Requisitos

- Docker Desktop abierto y funcionando.
- Node.js 22 o superior.
- Terminal PowerShell.
- Estar parado en la carpeta del proyecto:

```powershell
cd F:\ProyectoGym
```

## Solo la primera vez

Si todavia no existen los archivos de entorno, copiarlos desde los ejemplos:

```powershell
Copy-Item .env.example .env
Copy-Item apps\api\.env.example apps\api\.env
Copy-Item apps\web\.env.example apps\web\.env.local
```

Instalar dependencias si no existe `node_modules` o si se borraron:

```powershell
npm install
```

Generar el cliente de Prisma:

```powershell
npm run prisma:generate
```

## Arranque normal despues de prender la PC

1. Abrir Docker Desktop y esperar a que diga que esta corriendo.

2. Abrir una terminal en el proyecto:

```powershell
cd F:\ProyectoGym
```

3. Levantar PostgreSQL:

```powershell
npm run db:up
```

4. Levantar el backend:

```powershell
npm run dev:api
```

5. Abrir otra terminal, volver al proyecto y levantar el frontend:

```powershell
cd F:\ProyectoGym
npm run dev:web
```

6. Probar en el navegador:

- Frontend: `http://localhost:3000`
- API health: `http://localhost:3001/api/health`
- Swagger/API docs: `http://localhost:3001/api/docs`

## Como dejar de correrlo

En cada terminal donde este corriendo backend o frontend, presionar:

```text
Ctrl + C
```

Para apagar tambien la base de datos:

```powershell
npm run db:down
```

## Comandos utiles

Verificar que Docker tenga la base corriendo:

```powershell
docker ps
```

Volver a generar Prisma Client:

```powershell
npm run prisma:generate
```

Ejecutar tests del backend:

```powershell
npm test
```

Ejecutar lint:

```powershell
npm run lint
```

Compilar todo:

```powershell
npm run build
```

## Problemas comunes

### Docker no esta abierto

Si `npm run db:up` falla, abrir Docker Desktop, esperar unos segundos y repetir:

```powershell
npm run db:up
```

### El puerto 3000 o 3001 ya esta ocupado

Puede haber una terminal vieja corriendo. Cerrarla con `Ctrl + C`.

Si no sabes cual proceso lo esta usando:

```powershell
netstat -ano | findstr :3000
netstat -ano | findstr :3001
```

Despues se puede finalizar el proceso por PID:

```powershell
taskkill /PID NUMERO_DEL_PID /F
```

### Faltan dependencias

Si aparece un error de paquete faltante:

```powershell
npm install
```

### Cambiaron variables de entorno

Si se modifican `apps\api\.env` o `apps\web\.env.local`, reiniciar el backend o frontend con `Ctrl + C` y volver a correr el comando correspondiente.

## Resumen rapido

En la primera terminal:

```powershell
cd F:\ProyectoGym
npm run db:up
npm run dev:api
```

En la segunda terminal:

```powershell
cd F:\ProyectoGym
npm run dev:web
```
