# La Carrera del Gato — Propósito educativo y relación con la computación cuántica

> Minijuego de **Quantum Party**, creado para la **Quantum Hub Winter School**.
> Categoría 1 · Concepto central: **superposición y medición**.

---

## 1. ¿Por qué creamos este juego?

La computación cuántica se enseña casi siempre con **matemática abstracta** (vectores, matrices,
números complejos) y **figuras estáticas**. Para un público joven de la Winter School eso genera dos
barreras: se percibe como "difícil" y como algo lejano que no se puede *tocar*.

**La Carrera del Gato** nace para romper esas dos barreras a la vez:

- **Convertir un concepto cuántico en una mecánica de juego que se siente en el cuerpo.** En lugar de
  leer "un qubit puede estar en varios estados a la vez", el jugador **mantiene la superposición
  presionada y literalmente atraviesa los muros ocupando los tres carriles al mismo tiempo**. El
  concepto deja de ser una frase y pasa a ser una acción con consecuencias.
- **Aprender jugando, sin fricción.** Es un *endless-runner* estilo Subway Surfers: familiar,
  inmediato, competitivo. El aprendizaje ocurre **mientras** te diviertes, no en una pantalla de
  teoría aparte. La teoría aparece como *feedback* del propio juego (paneles "¿Sabías que…?",
  colores, el duelo de preguntas), no como un muro de texto previo.

El objetivo pedagógico es que, al terminar una partida, un joven pueda explicar con sus palabras qué
es **superposición**, qué significa **medir/colapsar** un qubit y por qué la probabilidad es la
**amplitud al cuadrado** — sin haber sentido que "estudió".

---

## 2. La relación cuántica, aspecto por aspecto

Cada mecánica del juego es una **metáfora fiel** de un fenómeno cuántico real. No son adornos: la
lógica del juego se comporta como se comporta la física.

### 2.1 El escudo de superposición = estar en todos los carriles a la vez
Mantener presionada la superposición pone al personaje en **los tres carriles simultáneamente**
(lo mostramos con **réplicas fantasma** a los costados y un aura). Así puede atravesar los muros
rojos: no está en "un" carril esquivando, está en **todos**.

> **Cuántica:** un qubit en superposición no tiene un valor definido de 0 o 1; existe como una
> combinación de ambos hasta que se lo mide. El escudo *es* esa superposición hecha jugable.

### 2.2 La barra de coherencia = la superposición es frágil y cuesta
La superposición **drena una barra de coherencia** (se agota en ~2 s) y necesita **recargarse**. No
se puede vivir en superposición todo el tiempo.

> **Cuántica:** mantener un estado en superposición es costoso y frágil. La pérdida de coherencia
> (**decoherencia**) es exactamente el motivo por el que los computadores cuánticos reales son tan
> difíciles de construir: el entorno "mide" al qubit sin permiso y destruye la superposición.

### 2.3 Chocar con un muro = una medición que colapsa el estado
Si la coherencia se agota o el jugador deja de sostener la superposición frente a un muro, el sistema
lo **mide**: colapsa a **un** carril concreto. Si ahí hay un muro, **choca y se aturde**.

> **Cuántica:** al medir un qubit, la superposición **colapsa** a un único resultado (0 o 1). El
> choque es la penalización de haber sido medido en el peor momento — la superposición desaparece y
> te quedas con un solo estado definido.

### 2.4 El anillo de carga con color = amplitud y probabilidad
El anillo bajo cada personaje se llena con **su color** conforme recarga la superposición, mostrando
cuánta "capacidad de superposición" tiene disponible.

> **Cuántica:** cada estado tiene una **amplitud**, y la **probabilidad de medirlo es esa amplitud al
> cuadrado (regla de Born)**. El juego usa esta idea para que el jugador vea que el recurso cuántico
> es medible y cuantificable, no mágico.

### 2.5 El bot (Cobraveja) = aleatoriedad cuántica real, no un `random` cualquiera
El bot **no** usa un número aleatorio común para decidir si esquiva. **Prepara un qubit en un ángulo
θ y lo mide**: con probabilidad **cos²θ** esquiva y con **sin²θ** falla y choca. Su imperfección es
literalmente una **medición cuántica**.

> **Cuántica:** esto ilustra que la aleatoriedad cuántica es **fundamental** (viene de la medición,
> regla de Born), no un truco de programación. Y como el bot corre de forma **clásica** (nunca usa
> superposición), el jugador entiende que **la superposición es la ventaja** que la cuántica ofrece
> sobre lo clásico.

### 2.6 El duelo Verdadero/Falso = repaso activo de qBronze
Cuando dos jugadores chocan a la vez, se lanza un **duelo de preguntas** de dificultad creciente,
basadas en el temario **qBronze de QWorld**: bits vs qubits, superposición, compuertas X/Z/H,
medición/Born, interferencia (H·H = I), pares de Bell, teleportación, codificación superdensa y
Grover. Quien responde mal se aturde.

> **Cuántica:** consolida el vocabulario formal justo en el momento de máxima tensión del juego —
> el conocimiento se refuerza cuando importa y hay algo en juego.

### 2.7 Los paneles "¿Sabías que…?" = puente juego ↔ computación cuántica
Durante la carrera rota información breve explicando **por qué** cada mecánica corresponde a un
fenómeno cuántico, cerrando el círculo entre "lo que hago" y "lo que significa".

---

## 3. ¿Por qué lo hicimos así (decisiones didácticas)?

| Decisión de diseño | Razón pedagógica |
|---|---|
| **Runner tipo Subway Surfers** | Formato familiar y adictivo → cero fricción de entrada; el aprendizaje va "de polizón" en la diversión. |
| **La superposición se *mantiene presionada*** | El concepto se aprende con el cuerpo (una acción sostenida), no memorizando una definición. |
| **La superposición se agota y recarga** | Enseña que la coherencia es un recurso frágil y limitado (decoherencia), no un poder infinito. |
| **Chocar = ser medido** | Hace *tangible* la consecuencia del colapso: la medición no es neutra, transforma el estado. |
| **Réplicas fantasma en los tres carriles** | Visualiza "estar en varios estados a la vez", lo más contraintuitivo de la cuántica. |
| **Bot con decisión por regla de Born** | La aleatoriedad del rival es un concepto cuántico real y verificable, no un `Math.random`. |
| **Bot clásico y superable (rubber-banding)** | Se mantiene reñido y visible, y demuestra que **la superposición da ventaja** frente a lo clásico. |
| **Duelo de preguntas qBronze de dificultad creciente** | Refuerza el vocabulario formal de forma activa y competitiva, escalando con el jugador. |
| **Colores por personaje + anillos + auras** | Traduce cantidades abstractas (amplitud, coherencia) a señales visuales inmediatas. |
| **Contenido trazable a `qbronze_docs`** | Rigor: lo que se enseña jugando coincide con el currículo formal de QWorld, no se inventa. |

---

## 4. Qué se lleva el jugador

Al terminar una partida, un asistente de la Winter School debería poder responder:

1. **¿Qué es la superposición?** — Estar en varios estados (carriles) a la vez, no en uno solo.
2. **¿Qué significa medir/colapsar?** — Que el estado se reduce a un único resultado (chocar contra
   un muro concreto), y ya no vuelve atrás.
3. **¿Por qué es frágil?** — Porque cuesta mantenerla (la barra se agota) y el entorno tiende a
   medirte (decoherencia).
4. **¿De dónde viene el azar cuántico?** — De la medición (regla de Born, probabilidad = amplitud²),
   como en la decisión del bot.
5. **¿Qué ventaja da la cuántica?** — Hacer varias cosas "a la vez" (superposición) es algo que lo
   clásico (el bot) no puede.

**En una frase:** convertimos los conceptos más abstractos de la computación cuántica —
superposición, medición, colapso, regla de Born y decoherencia — en mecánicas que se juegan, se
sienten y se recuerdan.
