# Modelos .glb (núcleo)

Aquí van los **modelos siempre-necesarios** del juego, comprimidos con Draco/meshopt:

- `alicia.glb` — personaje jugador 1
- `conejo.glb` — personaje jugador 2
- `board.glb` — tablero por turnos

Props opcionales por minijuego pueden ir en Supabase Storage con preload (ver plan de arquitectura).

## Comprimir un .glb

```bash
pnpm dlx gltf-pipeline -i modelo.glb -o alicia.glb --draco.compressionLevel=7
# Generar componente tipado R3F:
pnpm dlx gltfjsx alicia.glb --types
```

El decoder Draco va en `public/draco/`. Mientras no existan los .glb, las escenas usan geometrías
placeholder (cápsulas de color) — ver `src/scenes/minigames/cat-race/CatRaceScene.tsx`.
