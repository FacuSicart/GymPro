import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  ExerciseApprovalStatus,
  ExerciseOperationalStatus,
  Prisma,
  PrismaClient,
  UserRole,
} from '@prisma/client';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is required.');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const simplyFitnessExercises = [
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/barbell-bench-press",
    "sourceGroup": "Pectorales",
    "name": "Press de banca con barra",
    "description": "Ejercicio para pectorales, tríceps y deltoides anteriores",
    "primaryMuscleGroup": "pecho",
    "secondaryMuscleGroups": [
      "tríceps",
      "hombros"
    ],
    "movementPattern": "Empuje horizontal",
    "equipmentNeeded": "Barra, banco",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "Acostado en el banco, con los pies en el suelo. Agarra la barra con un agarre más amplio que el ancho de los hombros. Tus antebrazos deben estar perpendiculares al suelo. Desengancha la barra y bájala lentamente hasta la parte inferior del pecho. A medida que contraes los pectorales, empuja la carga hacia arriba hasta que los brazos estén casi rectos. Durante todo el movimiento: - Mantén los codos en el exterior para poner el máximo esfuerzo en el pecho y el mínimo en los deltoides anteriores y el tríceps. - Mantén los hombros apoyados en la banca.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, elevar los hombros o abrir/cerrar demasiado los codos.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en molestias de hombro, codo o muñeca.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Barbell-Bench-Press_0316b783-43b2-44f8-8a2b-b177a2cfcbfc_600x600.png?v=1612137800",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/incline-dumbbell-bench-press",
    "sourceGroup": "Pectorales",
    "name": "Press banca inclinado con mancuernas",
    "description": "Ejercicio para pectorales, tríceps y deltoides anteriores",
    "primaryMuscleGroup": "pecho",
    "secondaryMuscleGroups": [
      "tríceps",
      "hombros"
    ],
    "movementPattern": "Empuje horizontal",
    "equipmentNeeded": "Mancuernas, banco",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "Tumbado en el banco inclinado, con los pies apoyados en el suelo, una mancuerna en cada mano, agarre en pronación. Sostén las mancuernas a cada lado a la altura del pecho. Tus antebrazos deben estar perpendiculares al suelo. Mientras contraes tus pectorales, empuja la carga hacia arriba hasta que tus brazos estén casi rectos, luego vuelve a la posición inicial. Durante todo el movimiento: - Mantén los codos hacia afuera para poner el máximo esfuerzo en los pectorales y el mínimo en los deltoides frontales y el tríceps. - Mantén los hombros pegados al banco.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, elevar los hombros o abrir/cerrar demasiado los codos.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en molestias de hombro, codo o muñeca.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Incline-Dumbbell-Bench-Press_c2bf89a2-433f-4a8f-9801-67c679980867_600x600.png?v=1612138008",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/peck-deck",
    "sourceGroup": "Pectorales",
    "name": "Aperturas en máquina Peck Deck o Contractora",
    "description": "Ejercicio para pectorales, y deltoides anteriores",
    "primaryMuscleGroup": "pecho",
    "secondaryMuscleGroups": [
      "hombros"
    ],
    "movementPattern": "Aducción horizontal de hombro",
    "equipmentNeeded": "Máquina Peck Deck",
    "equipmentType": "maquina",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "Sentado en la máquina \"Peck deck\" con la espalda pegada al respaldo, los antebrazos bien apoyados contra las piezas acolchadas previstas para este fin. La parte superior de los brazos debe estar paralela al suelo y en línea con los hombros. Aprieta los brazos tanto como sea posible siguiendo el movimiento de la máquina. Contrae el pecho al final del movimiento y luego vuelve lentamente a la posición inicial.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, elevar los hombros o abrir/cerrar demasiado los codos.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en molestias de hombro, codo o muñeca.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Peck-Deck_600x600.png?v=1612137910",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/cable-crossover",
    "sourceGroup": "Pectorales",
    "name": "Cruce de poleas",
    "description": "Ejercicio para pectorales, y deltoides anteriores",
    "primaryMuscleGroup": "pecho",
    "secondaryMuscleGroups": [
      "hombros"
    ],
    "movementPattern": "Aducción horizontal de hombro",
    "equipmentNeeded": "Máquina de poleas",
    "equipmentType": "polea",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "Toma los manerales que están en los extremos de cada cable y colócate en el centro entre las poleas. Dobla el pecho ligeramente hacia adelante y mantén los codos ligeramente doblados. Aprieta lentamente los brazos frente al pecho como si fuera un arco. Mantén los codos ligeramente flexionados durante el movimiento. Cuando las manos se junten, mantén la posición por un momento, contrayendo el pecho. Luego vuelve lentamente a la posición original.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, elevar los hombros o abrir/cerrar demasiado los codos.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en molestias de hombro, codo o muñeca.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Cable-Crossover_09c90616-2777-47ed-927e-d5987edfce09_600x600.png?v=1612138036",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/incline-barbell-bench-press",
    "sourceGroup": "Pectorales",
    "name": "Press de banca inclinado con barra",
    "description": "Ejercicio para pectorales, tríceps y deltoides anteriores",
    "primaryMuscleGroup": "pecho",
    "secondaryMuscleGroups": [
      "tríceps",
      "hombros"
    ],
    "movementPattern": "Empuje horizontal",
    "equipmentNeeded": "Barra, banco",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "Tumbado en un banco inclinado con los pies en el suelo. Toma la barra con un agarre más amplio que el ancho de los hombros. Tus antebrazos deben estar perpendiculares al suelo. Saca la barra y bájala lentamente hasta la parte superior de tu pecho. A medida que contraes los pectorales, empuja la carga hacia arriba hasta que los brazos estén casi rectos. Durante todo el movimiento: - Mantén los codos hacia afuera para poner el máximo esfuerzo en el pecho y el mínimo en los deltoides frontales y el tríceps. - Mantén los hombros pegados al banco.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, elevar los hombros o abrir/cerrar demasiado los codos.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en molestias de hombro, codo o muñeca.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Incline-Barbell-Bench-Press_dc0c6279-d038-44f5-a682-54c2a5e2602c_600x600.png?v=1612137944",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/dumbbell-bench-press",
    "sourceGroup": "Pectorales",
    "name": "Press de banca con mancuernas",
    "description": "Ejercicio para pectorales, tríceps y deltoides anteriores",
    "primaryMuscleGroup": "pecho",
    "secondaryMuscleGroups": [
      "tríceps",
      "hombros"
    ],
    "movementPattern": "Empuje horizontal",
    "equipmentNeeded": "Mancuernas, banco",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "Tumbado en el banco, con los pies en el suelo, una mancuerna en cada mano, agarre de pronación. Sostén las mancuernas a los lados a la altura del pecho. Los antebrazos deben estar perpendiculares al suelo. Contrae los pectorales, y empuja la carga hacia arriba hasta que los brazos estén casi extendidos, y luego vuelve a la posición inicial. Durante todo el movimiento: - Mantén los codos hacia afuera para poner el máximo esfuerzo en los pectorales y el mínimo en los deltoides frontales y el tríceps. - Mantén los hombros pegados al banco.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, elevar los hombros o abrir/cerrar demasiado los codos.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en molestias de hombro, codo o muñeca.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Dumbbell-Bench-Press_13090f67-ccfc-4f3a-9bab-e75d753fa9fa_600x600.png?v=1612137970",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/dumbbell-fly",
    "sourceGroup": "Pectorales",
    "name": "Aperturas con mancuernas",
    "description": "Ejercicio para pectorales y deltoides anteriores",
    "primaryMuscleGroup": "pecho",
    "secondaryMuscleGroups": [
      "hombros"
    ],
    "movementPattern": "Aducción horizontal de hombro",
    "equipmentNeeded": "Mancuernas, banco",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "Tumbado en el banco, con los pies en el suelo, una mancuerna en cada mano. Sujeta las pesas con un agarre neutral, con los brazos extendidos sobre el pecho. Baja lentamente las mancuernas a los lados en un arco con los brazos hasta sentir un estiramiento en los pectorales. No bajes por debajo del nivel de los hombros. Luego vuelve a la posición original, realizando el mismo arco. Durante todo el movimiento: - Mantén los codos apuntando hacia afuera y ligeramente doblados para reducir la tensión en la articulación. - Mantén los hombros pegados al banco.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, elevar los hombros o abrir/cerrar demasiado los codos.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en molestias de hombro, codo o muñeca.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Dumbbell-Fly_119e2918-4241-4f55-bd77-c98a0c76c6c8_600x600.png?v=1612137840",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/incline-dumbbell-fly",
    "sourceGroup": "Pectorales",
    "name": "Aperturas inclinadas con mancuernas",
    "description": "Ejercicio para pectorales y deltoides anteriores",
    "primaryMuscleGroup": "pecho",
    "secondaryMuscleGroups": [
      "hombros"
    ],
    "movementPattern": "Aducción horizontal de hombro",
    "equipmentNeeded": "Mancuernas, banco",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "Tumbado en el banco inclinado, con los pies en el suelo, una mancuerna en cada mano. Sujeta las pesas con un agarre neutral con los brazos extendidos sobre el pecho. Baja lentamente las mancuernas a los lados en un arco con los brazos hasta sentir un estiramiento en los pectorales. No bajes por debajo del nivel de los hombros. Luego vuelve a la posición original, haciendo el mismo arco. Durante todo el movimiento: - Mantén los codos hacia afuera y ligeramente doblados para reducir la tensión en la articulación. - Mantén los hombros pegados al banco.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, elevar los hombros o abrir/cerrar demasiado los codos.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en molestias de hombro, codo o muñeca.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Incline-Dumbbell-Fly_44d253c3-da60-45b2-b0ba-88a3bb79da09_600x600.png?v=1612137870",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/chest-press-machine",
    "sourceGroup": "Pectorales",
    "name": "Press de banca en máquina sentado",
    "description": "Ejercicio para pectorales, tríceps y deltoides frontales",
    "primaryMuscleGroup": "pecho",
    "secondaryMuscleGroups": [
      "tríceps",
      "hombros"
    ],
    "movementPattern": "Empuje horizontal",
    "equipmentNeeded": "Máquina sentado",
    "equipmentType": "maquina",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "Ponla máquina de press de pecho para que al sentarte los agarres estén alineados con la parte inferior del pecho. Asegúrate de que estás sentado con la espalda bien pegada al asiento. Agarra una manija con cada mano, saca el pecho hacia afuera, mantén la cabeza contra el reposacabezas. Respira profundamente y empuja lentamente las manijas hacia adelante hasta que tus brazos estén casi completamente extendidos. Haz una pausa justo antes del bloqueo, y luego regresa lentamente las manijas a la posición inicial. Haz una pausa justo antes de que las manijas se detengan completamente y realiza otra repetición.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, elevar los hombros o abrir/cerrar demasiado los codos.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en molestias de hombro, codo o muñeca.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Chest-Press-Machine_ab8cd29d-5698-4110-a938-098bda19b5fc_600x600.png?v=1621163108",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/barbell-declined-bench-press",
    "sourceGroup": "Pectorales",
    "name": "Press de banca declinado con barra",
    "description": "Ejercicio para pectoral inferior, deltoides anterior y tríceps",
    "primaryMuscleGroup": "pecho",
    "secondaryMuscleGroups": [
      "hombros",
      "tríceps"
    ],
    "movementPattern": "Empuje horizontal",
    "equipmentNeeded": "Banco declinado, barra, discos",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "Tumbado en el banco declinado, con las piernas apoyadas en las almohadillas. Sujeta la barra con un agarre más ancho que la anchura de los hombros, con las manos en pronación. Los antebrazos deben estar perpendiculares al suelo. Suelta la barra y bájala lentamente hasta la parte inferior de tus pectorales. Mientras contraes los músculos del pecho, empuja la barra con el peso hacia arriba hasta que tus brazos estén casi estirados. Durante todo el movimiento: - Mantén los codos hacia afuera para forzar al máximo los músculos del pecho y lo menos posible los deltoides anteriores y los tríceps. - Mantén los hombros pegados al banco.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, elevar los hombros o abrir/cerrar demasiado los codos.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en molestias de hombro, codo o muñeca.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Barbell-Declined-Bench-Press_600x600.png?v=1619977283",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/dumbbell-declined-bench-press",
    "sourceGroup": "Pectorales",
    "name": "Press de banca declinado con mancuernas",
    "description": "Ejercicio para pectoral inferior, deltoides anterior y tríceps",
    "primaryMuscleGroup": "pecho",
    "secondaryMuscleGroups": [
      "hombros",
      "tríceps"
    ],
    "movementPattern": "Empuje horizontal",
    "equipmentNeeded": "Banco declinado, mancuernas",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "Tumbado en el banco declinado, una mancuerna en cada mano, agarre en pronación. Sujeta las mancuernas a los lados a la altura del pecho, con los codos hacia fuera. Los antebrazos deben estar perpendiculares al suelo. Mientras contraes los pectorales, empuja las mancuernas hacia arriba hasta que los brazos estén casi estirados, y luego vuelve a la posición inicial. Durante todo el movimiento: - Mantén los codos hacia afuera para asegurarte de que los pectorales están totalmente implicados y los deltoides anteriores y los tríceps intervienen lo mínimo. - Mantén los hombros pegados al banco.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, elevar los hombros o abrir/cerrar demasiado los codos.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en molestias de hombro, codo o muñeca.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Dumbbell-Declined-Bench-Press_600x600.png?v=1619977242",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/push-ups",
    "sourceGroup": "Pectorales",
    "name": "Flexiones",
    "description": "Ejercicio para pectorales, tríceps, deltoides y bíceps",
    "primaryMuscleGroup": "pecho",
    "secondaryMuscleGroups": [
      "hombros",
      "tríceps",
      "bíceps"
    ],
    "movementPattern": "Patrón multiarticular de entrenamiento",
    "equipmentNeeded": "Peso corporal",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "Boca abajo, brazos extendidos, manos separadas, apoyadas en el suelo y alineadas con los músculos pectorales. Las piernas estiradas y la cara apuntando hacia el suelo. Dobla lentamente los brazos, dejando que el torso se acerque al suelo, hasta que los codos formen un ángulo de 90 grados. Luego empuja las manos hacia arriba hasta la posición inicial.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, elevar los hombros o abrir/cerrar demasiado los codos.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en molestias de hombro, codo o muñeca.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Push-Ups_600x600.png?v=1640121436",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/dumbbell-bent-over-row-single-arm",
    "sourceGroup": "Espalda",
    "name": "Remo con mancuerna a una mano",
    "description": "Ejercicio para espalda, deltoides posteriores y bíceps",
    "primaryMuscleGroup": "espalda",
    "secondaryMuscleGroups": [
      "hombros",
      "bíceps"
    ],
    "movementPattern": "Tirón horizontal",
    "equipmentNeeded": "Mancuerna, banco",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "Coloca tu rodilla izquierda y tu mano izquierda en el banco con el pecho paralelo al suelo. Mantén el pie derecho en el suelo y agarra la mancuerna todavía en el suelo con la mano derecha en un agarre neutral. Manteniendo el brazo cerca del cuerpo, levanta la mancuerna lo más alto posible levantando el codo y manteniendo el antebrazo perpendicular al suelo. Una vez que la serie termine, haz lo mismo con el otro brazo.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, tirar con brazos sin retraer escápulas o redondear la espalda.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar o antecedentes de hernia/discopatía.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Dumbbell-Bent-Over-Row-_Single-Arm_49867db3-f465-4fbc-b359-29cbdda502e2_600x600.png?v=1612138069",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/wide-grip-pulldown",
    "sourceGroup": "Espalda",
    "name": "Jalón con agarre ancho",
    "description": "Ejercicio para espalda y bíceps",
    "primaryMuscleGroup": "espalda",
    "secondaryMuscleGroups": [
      "bíceps"
    ],
    "movementPattern": "Tirón vertical",
    "equipmentNeeded": "Máquina de jalón, barra",
    "equipmentType": "maquina",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "Sentado, los muslos bajo las partes acolchadas, la barra agarrada en pronación, las manos más separadas que el ancho de los hombros. Mantén los codos apuntados hacia afuera y la espalda recta. Tira de la barra hasta llegar a la barbilla. Mantén la contracción por un momento antes de volver lentamente a la posición inicial. Durante el movimiento, no dejes que tus codos se adelanten.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, tirar con brazos sin retraer escápulas o redondear la espalda.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar o antecedentes de hernia/discopatía.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Wide-Grip-Pulldown_91fcba9b-47a2-4185-b093-aa542c81c55c_600x600.png?v=1612138105",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/seated-cable-row",
    "sourceGroup": "Espalda",
    "name": "Remo en máquina",
    "description": "Ejercicio para espalda, deltoides posteriores y bíceps",
    "primaryMuscleGroup": "espalda",
    "secondaryMuscleGroups": [
      "hombros",
      "bíceps"
    ],
    "movementPattern": "Tirón horizontal",
    "equipmentNeeded": "Máquina de poleas",
    "equipmentType": "polea",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "Sentado en el banco de la máquina con los pies en la cuña. Coge la doble manivela que está unida al cable con ambas manos. Mantén la espalda recta y las rodillas ligeramente flexionadas. Tira de la carga hacia tu abdomen. Aprieta la espalda al final del movimiento llevando los codos lo más atrás posible. Luego vuelve lentamente a la posición inicial.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, tirar con brazos sin retraer escápulas o redondear la espalda.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar o antecedentes de hernia/discopatía.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Seated-Cable-Row_9470fa48-f0d1-40b1-a980-caee9e6f2e53_600x600.png?v=1612138127",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/close-grip-pulldown",
    "sourceGroup": "Espalda",
    "name": "Jalón al pecho con agarre cerrado",
    "description": "Ejercicio para espalda y bíceps",
    "primaryMuscleGroup": "espalda",
    "secondaryMuscleGroups": [
      "bíceps"
    ],
    "movementPattern": "Tirón vertical",
    "equipmentNeeded": "Máquina de jalón, barra",
    "equipmentType": "maquina",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "Sentado, con los muslos bajo las partes acolchadas, la doble asa agarrada con ambas manos. Manteniendo la espalda recta. Lleva la carga hasta la parte superior del pecho sin apartar los codos del cuerpo. Mantén la contracción por un momento antes de volver lentamente a la posición inicial.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, tirar con brazos sin retraer escápulas o redondear la espalda.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar o antecedentes de hernia/discopatía.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Close-Grip-Pulldown_072bb5ce-e3d9-4007-b8d2-d343e9d1051b_600x600.png?v=1612138178",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/barbell-row",
    "sourceGroup": "Espalda",
    "name": "Remo con barra",
    "description": "Ejercicio para espalda, deltoides posteriores y bíceps",
    "primaryMuscleGroup": "espalda",
    "secondaryMuscleGroups": [
      "hombros",
      "bíceps"
    ],
    "movementPattern": "Tirón horizontal",
    "equipmentNeeded": "Barra",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "De pie con las rodillas ligeramente flexionadas, agarrando la barra con las manos en pronación, agarre más amplio que el ancho de los hombros. El pecho inclinado hacia adelante, manteniendo la espalda recta, el pecho arqueado. Tira de la carga hacia el abdomen. Aprieta la espalda al final del movimiento, los hombros y los codos hacia atrás. Luego vuelve lentamente a la posición inicial.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, tirar con brazos sin retraer escápulas o redondear la espalda.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar o antecedentes de hernia/discopatía.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Barbell-Row_4beb1d94-bac9-4538-9578-2d9cf93ef008_600x600.png?v=1612138201",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/behind-neck-pulldown",
    "sourceGroup": "Espalda",
    "name": "Jalón tras nuca",
    "description": "Ejercicio para espalda y bíceps",
    "primaryMuscleGroup": "espalda",
    "secondaryMuscleGroups": [
      "bíceps"
    ],
    "movementPattern": "Tirón vertical",
    "equipmentNeeded": "Máquina de jalón, barra",
    "equipmentType": "maquina",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "Sentado, los muslos bajo las partes acolchadas, la barra agarrada en pronación, las manos más separadas que la anchura de los hombros. Mantén los codos apuntando hacia afuera y la espalda recta. Tira de la barra hasta la parte posterior del cuello. Mantén la contracción por un momento antes de volver lentamente a la posición inicial. Durante el movimiento, no dejes que tus codos se adelanten.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, tirar con brazos sin retraer escápulas o redondear la espalda.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar o antecedentes de hernia/discopatía.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Behind-Neck-Pulldown_f0f50b6b-ad34-48cd-8663-84ee6a581928_600x600.png?v=1612138228",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/reverse-grip-pulldown",
    "sourceGroup": "Espalda",
    "name": "Jalón al pecho con agarre invertido",
    "description": "Ejercicio para espalda y bíceps",
    "primaryMuscleGroup": "espalda",
    "secondaryMuscleGroups": [
      "bíceps"
    ],
    "movementPattern": "Tirón vertical",
    "equipmentNeeded": "Máquina de jalón, barra",
    "equipmentType": "maquina",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "Sentado, muslos bajo las partes acolchadas, barra agarrada en supinación, manos separadas a la anchura de los hombros. Manteniendo la espalda recta. Tira de la barra hasta la parte superior del pecho. Mantenga la contracción por un momento, los hombros bien atrás antes de volver lentamente a la posición inicial.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, tirar con brazos sin retraer escápulas o redondear la espalda.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar o antecedentes de hernia/discopatía.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Reverse-Grip-Pulldown_10c5341f-30fd-4126-8fd7-2fa05c079889_600x600.png?v=1612138255",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/rope-pulldown",
    "sourceGroup": "Espalda",
    "name": "Jalón en polea con cuerda",
    "description": "Ejercicio para espalda y tríceps",
    "primaryMuscleGroup": "espalda",
    "secondaryMuscleGroups": [
      "tríceps"
    ],
    "movementPattern": "Tirón vertical",
    "equipmentNeeded": "Máquina de jalón, cuerda",
    "equipmentType": "polea",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "De pie frente a la polea alta, las rodillas ligeramente dobladas y el pecho ligeramente inclinado hacia adelante. Toma un extremo de la cuerda en cada mano con un agarre neutral. Tira de la cuerda hasta las caderas, dejando que los brazos describan un arco circular. Mantén tus codos ligeramente doblados y cercanos al cuerpo. Al final del movimiento, contrae la espalda apretando los hombros hacia atrás, y luego vuelve a la posición inicial.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, tirar con brazos sin retraer escápulas o redondear la espalda.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar o antecedentes de hernia/discopatía.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Rope-Pulldown_24c7b22e-bf99-4ade-ba6c-c7b2f20ffa9a_600x600.png?v=1612138283",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/t-bar-rows",
    "sourceGroup": "Espalda",
    "name": "Remo en barra T",
    "description": "Ejercicio para espalda, trapecio, bíceps y deltoides posteriores",
    "primaryMuscleGroup": "espalda",
    "secondaryMuscleGroups": [
      "hombros",
      "bíceps"
    ],
    "movementPattern": "Tirón horizontal",
    "equipmentNeeded": "Máquina de barra T",
    "equipmentType": "maquina",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "Usar una máquina de Barra T (o coloca una barra en la esquina de una habitación). De pie con los pies a cada lado de la barra, dobla las rodillas e inclínate hacia adelante de modo que tu pecho esté directamente sobre la placa de la barra. Toma el agarre con ambas manos. Manteniendo la postura, tira de las asas para que la placa suba hacia tu pecho. Haz una pausa justo antes de que toque, y luego bájala lentamente.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, tirar con brazos sin retraer escápulas o redondear la espalda.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar o antecedentes de hernia/discopatía.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/T-Bar-Rows_600x600.png?v=1612092112",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/barbell-bent-over-rows-supinated-grip",
    "sourceGroup": "Espalda",
    "name": "Remo inclinado con barra con agarre supinado",
    "description": "Ejercicio para espalda y deltoides posterior",
    "primaryMuscleGroup": "espalda",
    "secondaryMuscleGroups": [],
    "movementPattern": "Tirón horizontal",
    "equipmentNeeded": "Barra, discos",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "De pie, con las rodillas ligeramente flexionadas. Toma la barra con un agarre por debajo (supinado) con las manos separadas a la anchura de los hombros. Inclínate hacia delante manteniendo la espalda recta y el pecho hacia afuera. Tira de la barra hacia el ombligo. Aprieta la espalda en la parte superior del movimiento, llevando los hombros y los codos por detrás del cuerpo. A continuación, vuelve lentamente a la posición inicial. Mantén los codos metidos durante todo el movimiento.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, tirar con brazos sin retraer escápulas o redondear la espalda.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar o antecedentes de hernia/discopatía.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Barbell-Bent-Over-Rows-Supinated-Grip_600x600.png?v=1619977891",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/pull-up",
    "sourceGroup": "Espalda",
    "name": "Elevaciones en barra fija",
    "description": "Ejercicio para espalda y bíceps",
    "primaryMuscleGroup": "espalda",
    "secondaryMuscleGroups": [
      "bíceps"
    ],
    "movementPattern": "Patrón multiarticular de entrenamiento",
    "equipmentNeeded": "Barra de tracción",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "Agarra la barra de tracción con un agarre en pronación, con la cabeza ligeramente levantada, las manos separadas a una distancia superior a la de los hombros y los codos ligeramente doblados. Realiza un movimiento de elevación llevando la barbilla hacia la barra. Luego vuelve lentamente a la posición inicial. La longitud de tus segmentos, tu fuerza y la movilidad de tus hombros determinarán la altura a la que puedes subir.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, tirar con brazos sin retraer escápulas o redondear la espalda.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar o antecedentes de hernia/discopatía.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Pull-Up_600x600.png?v=1619977612",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/behind-the-neck-pull-up",
    "sourceGroup": "Espalda",
    "name": "Elevaciones tras nuca en barra fija",
    "description": "Ejercicio para espalda y bíceps",
    "primaryMuscleGroup": "espalda",
    "secondaryMuscleGroups": [
      "bíceps"
    ],
    "movementPattern": "Patrón multiarticular de entrenamiento",
    "equipmentNeeded": "Barra de tracción",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "Agarra la barra de tracción con un agarre en pronación, con la cabeza ligeramente levantada, las manos con una separación superior a la anchura de los hombros y los codos ligeramente doblados. Elévate llevando la cabeza por delante de la barra. Luego vuelve lentamente a la posición inicial. La longitud de tus segmentos, tu fuerza y la movilidad de tus hombros determinarán la altura a la que puedes subir.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, tirar con brazos sin retraer escápulas o redondear la espalda.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar o antecedentes de hernia/discopatía.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Behind-the-Neck-Pull-Up_600x600.png?v=1619977573",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/pull-up-with-a-supinated-grip",
    "sourceGroup": "Espalda",
    "name": "Elevaciones en barra fija con agarre supinado",
    "description": "Ejercicio para espalda y bíceps",
    "primaryMuscleGroup": "espalda",
    "secondaryMuscleGroups": [
      "bíceps"
    ],
    "movementPattern": "Patrón multiarticular de entrenamiento",
    "equipmentNeeded": "Barra de tracción",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "Agarra la barra de tracción con un agarre inferior (supinado), la cabeza ligeramente levantada, las manos separadas a la anchura de los hombros, los codos ligeramente doblados y apuntando hacia delante. Realiza un movimiento de elevación llevando la barbilla hacia la barra. Luego vuelve lentamente a la posición inicial. La longitud de tus segmentos, tu fuerza y la movilidad de tus hombros determinarán la altura a la que puedes subir.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, tirar con brazos sin retraer escápulas o redondear la espalda.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar o antecedentes de hernia/discopatía.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Pull-Up-with-a-Supinated-Grip_600x600.png?v=1619977534",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/straight-arm-lat-pulldown",
    "sourceGroup": "Espalda",
    "name": "Jalón dorsal con brazos rectos",
    "description": "Ejercicio para espalda y tríceps",
    "primaryMuscleGroup": "espalda",
    "secondaryMuscleGroups": [
      "tríceps"
    ],
    "movementPattern": "Tirón vertical",
    "equipmentNeeded": "Barra recta, cable de polea alta",
    "equipmentType": "polea",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "De pie, frente a la máquina de cable de polea alta, con las rodillas ligeramente flexionadas, el torso inclinado, la espalda recta y el pecho hacia afuera. Toma la barra con un agarre superior (en pronación, con las palmas hacia abajo) con el codo ligeramente doblado. Tira de la barra hacia las caderas haciendo un arco. Contrae los dorsales juntando los omóplatos y vuelve lentamente a la posición inicial.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, tirar con brazos sin retraer escápulas o redondear la espalda.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar o antecedentes de hernia/discopatía.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Straight-Arm-Lat-Pulldown_600x600.png?v=1619977498",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/dumbbell-bent-over-rows",
    "sourceGroup": "Espalda",
    "name": "Remo inclinado con mancuernas",
    "description": "Ejercicio para espalda, bíceps y deltoides posteriores",
    "primaryMuscleGroup": "espalda",
    "secondaryMuscleGroups": [
      "bíceps",
      "hombros"
    ],
    "movementPattern": "Tirón horizontal",
    "equipmentNeeded": "Mancuernas",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "De pie, con las rodillas ligeramente flexionadas. Sujeta las mancuernas con un agarre neutro (con las palmas de las manos una frente a otra). Inclínate hacia delante manteniendo la espalda recta y el pecho hacia afuera. Tira de las mancuernas hacia las caderas. Aprieta la espalda en la parte superior del movimiento, llevando los hombros y los codos por detrás del cuerpo. A continuación, vuelve lentamente a la posición inicial. Mantén los codos hacia adentro durante todo el movimiento.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, tirar con brazos sin retraer escápulas o redondear la espalda.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar o antecedentes de hernia/discopatía.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Dumbbell-Bent-Over-Rows_600x600.png?v=1619977463",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/dumbbell-pullover",
    "sourceGroup": "Espalda",
    "name": "Pullover con mancuerna",
    "description": "Ejercicio para espalda, pecho y tríceps",
    "primaryMuscleGroup": "espalda",
    "secondaryMuscleGroups": [
      "tríceps"
    ],
    "movementPattern": "Extensión de hombro",
    "equipmentNeeded": "Banco, mancuerna",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "La parte superior de la espalda apoyada en el banco de forma transversal (ver ilustración). Los pies en el suelo, separados a la anchura de los hombros, la pelvis ligeramente más baja que la altura del banco. Sujeta la mancuerna con ambas manos por encima del pecho, con los brazos casi completamente extendidos. Manteniendo los codos ligeramente flexionados, baja lentamente la mancuerna por detrás de la cabeza en forma de arco. Cuando los brazos lleguen al nivel de la cabeza, vuelve lentamente a la posición inicial.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, tirar con brazos sin retraer escápulas o redondear la espalda.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar o antecedentes de hernia/discopatía.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Dumbbell-Pullover_600x600.png?v=1619977197",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/barbell-pullover",
    "sourceGroup": "Espalda",
    "name": "Pullover con barra",
    "description": "Ejercicio para espalda, pecho y tríceps",
    "primaryMuscleGroup": "espalda",
    "secondaryMuscleGroups": [
      "tríceps"
    ],
    "movementPattern": "Extensión de hombro",
    "equipmentNeeded": "Banco, barra, discos",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "Tumbado en un banco, con los pies en el suelo a la anchura de los hombros. Sujeta la barra con las manos en pronación por encima del pecho, con los brazos casi completamente extendidos. Con los codos ligeramente flexionados, baja lentamente la barra por detrás de la cabeza en forma de arco. Cuando los brazos estén a la altura de la cabeza, vuelve lentamente a la posición inicial.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, tirar con brazos sin retraer escápulas o redondear la espalda.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar o antecedentes de hernia/discopatía.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Barbell-Pullover_600x600.png?v=1619977155",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/barbell-deadlift",
    "sourceGroup": "Espalda",
    "name": "Peso muerto con barra",
    "description": "Ejercicio para todo el cuerpo, trabaja principalmente la espalda y las piernas",
    "primaryMuscleGroup": "isquiosurales",
    "secondaryMuscleGroups": [],
    "movementPattern": "Bisagra de cadera",
    "equipmentNeeded": "Barra, discos",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH",
      "CORE"
    ],
    "technicalInstructions": "Coloca la barra en el suelo delante de ti. Separa los pies un poco menos de la anchura de los hombros y dobla las rodillas. Con los brazos totalmente extendidos, coge la barra en pronación, con las manos separadas a la anchura de los hombros Mantén el torso ligeramente inclinado hacia delante, la espalda recta, los hombros echados hacia atrás y el pecho fuera. Inhala y aprieta los músculos abdominales. Manteniendo los brazos rectos, levanta la barra extendiendo las piernas y enderezando el torso para alcanzar una posición vertical. Exhala al final del movimiento. A continuación, vuelve lentamente a la posición inicial. Recuerda siempre no doblar la espalda.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, colapsar rodillas o perder columna neutra.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar, rodilla o cadera.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Barbell-Deadlift_600x600.png?v=1619977112",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/barbell-sumo-deadlift",
    "sourceGroup": "Espalda",
    "name": "Peso muerto sumo con barra",
    "description": "Ejercicio para todo el cuerpo, trabaja principalmente la espalda y las piernas",
    "primaryMuscleGroup": "isquiosurales",
    "secondaryMuscleGroups": [],
    "movementPattern": "Bisagra de cadera",
    "equipmentNeeded": "Barra, discos",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH",
      "CORE"
    ],
    "technicalInstructions": "La barra colocada en el suelo delante de ti. Las piernas separadas y los pies apuntando hacia afuera y alineados con las rodillas. Piernas flexionadas, muslos casi horizontales (según tu morfología). Agarre de la barra en pronación, con las manos separadas a la altura de los hombros. Torso ligeramente inclinado hacia delante, espalda recta, hombros echados hacia atrás y pecho fuera. Inhala y tensa los músculos abdominales. Manteniendo los brazos rectos, levanta la barra extendiendo las piernas y enderezando el torso para alcanzar una posición vertical. Exhala al final del movimiento. A continuación, vuelve lentamente a la posición inicial. Recuerda siempre no doblar la espalda.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, colapsar rodillas o perder columna neutra.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar, rodilla o cadera.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Barbell-Sumo-Deadlift_600x600.png?v=1619976908",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/trap-bar-deadlift",
    "sourceGroup": "Espalda",
    "name": "Peso muerto con barra hexagonal",
    "description": "Ejercicio para todo el cuerpo, trabaja principalmente la espalda y las piernas",
    "primaryMuscleGroup": "isquiosurales",
    "secondaryMuscleGroups": [],
    "movementPattern": "Bisagra de cadera",
    "equipmentNeeded": "Barra hexagonal, discos",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH",
      "CORE"
    ],
    "technicalInstructions": "De pie dentro de la barra hexagonal, con los pies separados algo menos de la anchura de los hombros y las rodillas dobladas. Agarra las asas de la barra hexagonal. Torso ligeramente inclinado hacia delante, espalda recta, hombros echados hacia atrás y pecho fuera. Inhala y aprieta los músculos abdominales. Manteniendo los brazos rectos, levanta la barra extendiendo las piernas y enderezando el torso para alcanzar una posición vertical. Exhala al final del movimiento. A continuación, vuelve lentamente a la posición inicial. Recuerda siempre no doblar la espalda.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, colapsar rodillas o perder columna neutra.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar, rodilla o cadera.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Trap-Bar-Deadlift_600x600.png?v=1619976866",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/dumbbell-deadlift",
    "sourceGroup": "Espalda",
    "name": "Peso muerto con mancuernas",
    "description": "Ejercicio para todo el cuerpo, trabaja principalmente la espalda y las piernas",
    "primaryMuscleGroup": "isquiosurales",
    "secondaryMuscleGroups": [],
    "movementPattern": "Bisagra de cadera",
    "equipmentNeeded": "Mancuernas",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH",
      "CORE"
    ],
    "technicalInstructions": "Las mancuernas en el suelo a ambos lados. Los pies separados un poco menos que la anchura de los hombros y las rodillas dobladas. Coge las mancuernas con un agarre neutro. Torso ligeramente inclinado hacia delante, espalda recta, hombros echados hacia atrás y pecho fuera. Inhala y tensa los músculos abdominales. Mientras mantienes los brazos extendidos, levanta las mancuernas extendiendo las piernas y enderezando el torso para alcanzar una posición vertical. Exhala al final del movimiento. A continuación, vuelve lentamente a la posición inicial. Recuerda siempre no doblar la espalda.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, colapsar rodillas o perder columna neutra.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar, rodilla o cadera.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Dumbbell-Deadlift_600x600.png?v=1619976747",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/barbell-shrug",
    "sourceGroup": "Espalda",
    "name": "Encogimiento de hombros con barra",
    "description": "Ejercicio para músculos del trapecio",
    "primaryMuscleGroup": "espalda",
    "secondaryMuscleGroups": [],
    "movementPattern": "Patrón multiarticular de entrenamiento",
    "equipmentNeeded": "Barra",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "De pie, sosteniendo la barra frente a ti, agarre en pronación, manos separadas a la altura de los hombros. Manteniendo los brazos extendidos, levanta los hombros lo más alto posible. Contrae los músculos del trapecio en la parte superior del movimiento, y luego vuelve lentamente a la posición inicial.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, tirar con brazos sin retraer escápulas o redondear la espalda.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar o antecedentes de hernia/discopatía.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Barbell-Shrug_4f8a4e15-96b9-4595-8e88-635bf83cc8ac_600x600.png?v=1612138751",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/dumbbell-shrugs",
    "sourceGroup": "Espalda",
    "name": "Encogimiento de hombros con mancuernas",
    "description": "Ejercicio para músculos del trapecio",
    "primaryMuscleGroup": "espalda",
    "secondaryMuscleGroups": [],
    "movementPattern": "Patrón multiarticular de entrenamiento",
    "equipmentNeeded": "Mancuernas",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "De pie, brazos extendidos a lo largo del cuerpo, una mancuerna en cada mano. Manteniendo los brazos extendidos, levanta los hombros lo más alto posible. Contrae los músculos del trapecio en la parte superior del movimiento, y luego vuelve lentamente a la posición inicial.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, tirar con brazos sin retraer escápulas o redondear la espalda.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar o antecedentes de hernia/discopatía.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Dumbbell-Shrugs_69a32385-3573-471b-a66e-3abdb0d95819_600x600.png?v=1619986777",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/dumbbell-shoulder-press",
    "sourceGroup": "Hombros",
    "name": "Press de hombro con mancuernas",
    "description": "Ejercicio para deltoides y tríceps",
    "primaryMuscleGroup": "hombros",
    "secondaryMuscleGroups": [
      "tríceps"
    ],
    "movementPattern": "Empuje vertical",
    "equipmentNeeded": "Mancuernas, banco",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH",
      "CORE"
    ],
    "technicalInstructions": "Sentado en un banco con la espalda bien apoyada contra el respaldo. Sujeta las mancuernas en tus manos (agarre de pronación) ligeramente por encima de la altura de los hombros. Los codos hacia afuera y los antebrazos perpendiculares al suelo. Levanta las mancuernas hasta que tus brazos estén completamente extendidos. Luego regresa a la posición original.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, elevar los hombros o abrir/cerrar demasiado los codos.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en molestias de hombro, codo o muñeca.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Dumbbell-Shoulder-Press_da0aa742-620a-45f7-9277-78137d38ff28_600x600.png?v=1612138495",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/dumbbell-lateral-raise",
    "sourceGroup": "Hombros",
    "name": "Elevación lateral con mancuernas",
    "description": "Ejercicio para deltoides y músculos del trapecio",
    "primaryMuscleGroup": "hombros",
    "secondaryMuscleGroups": [
      "músculos del trapecio"
    ],
    "movementPattern": "Abducción de hombro",
    "equipmentNeeded": "Mancuernas",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "De pie con los pies separados a la anchura de los hombros, los brazos a lo largo del cuerpo y una mancuerna en cada mano. Levanta lentamente los brazos de lado hasta una posición horizontal, manteniendo los codos ligeramente doblados. Contrae los deltoides por un momento en la posición alta, y luego vuelve lentamente a la posición inicial.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, elevar los hombros o abrir/cerrar demasiado los codos.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en molestias de hombro, codo o muñeca.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Dumbbell-Lateral-Raise_31c81eee-81c4-4ffe-890d-ee13dd5bbf20_600x600.png?v=1612138523",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/dumbbell-front-raise",
    "sourceGroup": "Hombros",
    "name": "Elevación frontal con mancuernas",
    "description": "Ejercicio para deltoides",
    "primaryMuscleGroup": "hombros",
    "secondaryMuscleGroups": [],
    "movementPattern": "Flexión de hombro",
    "equipmentNeeded": "Mancuernas",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "De pie, con los pies separados a la anchura de los hombros, una mancuerna en cada mano (agarre prono). Levanta lentamente los brazos hacia adelante hasta que estén paralelos al suelo. Contrae los deltoides durante un momento en la posición final, luego regresa lentamente a la posición inicial.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, elevar los hombros o abrir/cerrar demasiado los codos.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en molestias de hombro, codo o muñeca.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Dumbbell-Front-Raise_11804c3c-22d1-4589-a035-e30ad72149f3_600x600.png?v=1612138576",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/high-cable-rear-delt-fly",
    "sourceGroup": "Hombros",
    "name": "Cruces inversos en polea alta",
    "description": "Ejercicio para deltoides y músculos del trapecio",
    "primaryMuscleGroup": "hombros",
    "secondaryMuscleGroups": [
      "músculos del trapecio"
    ],
    "movementPattern": "Aducción horizontal de hombro",
    "equipmentNeeded": "Máquina de poleas",
    "equipmentType": "polea",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "De pie entre las poleas con el mango derecho en la mano izquierda y el mango izquierdo en la mano derecha. Los brazos doblados delante de ti a la altura del hombro. Apretando los deltoides posteriores y manteniendo los brazos casi rectos, tira de los codos lo más atrás posible en arco. Permanece en esta posición por un momento antes de volver a la posición inicial.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, elevar los hombros o abrir/cerrar demasiado los codos.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en molestias de hombro, codo o muñeca.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/High-Cable-Rear-Delt-Fly_600x600.png?v=1612541996",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/smith-machine-shoulder-press",
    "sourceGroup": "Hombros",
    "name": "Press de hombros en máquina Smith",
    "description": "Ejercicio para deltoides y tríceps",
    "primaryMuscleGroup": "hombros",
    "secondaryMuscleGroups": [
      "tríceps"
    ],
    "movementPattern": "Empuje vertical",
    "equipmentNeeded": "Máquina Smith",
    "equipmentType": "maquina",
    "goals": [
      "STRENGTH",
      "CORE"
    ],
    "technicalInstructions": "Sentado en un banco con la espalda bien apoyada contra el respaldo. Coloca el banco de manera que la barra caiga justo delante de tu cara. Agarra la barra con las manos en pronación. La espalda bien apoyada contra el respaldo, los codos hacia fuera y los antebrazos perpendiculares al suelo. Suelta la barra y llévala lentamente a la altura de tu barbilla. Contrae los hombros empujando la carga hacia arriba. Detén el movimiento justo antes de que tus brazos estén completamente extendidos. Luego regresa a la posición baja.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, elevar los hombros o abrir/cerrar demasiado los codos.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en molestias de hombro, codo o muñeca.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Smith-Machine-Shoulder-Press_e53bea60-c273-41e9-a70d-f5fa339c6780_600x600.png?v=1612138658",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/barbell-upright-row",
    "sourceGroup": "Hombros",
    "name": "Remo alto con barra",
    "description": "Ejercicio para deltoides, espalda y bíceps",
    "primaryMuscleGroup": "hombros",
    "secondaryMuscleGroups": [
      "bíceps"
    ],
    "movementPattern": "Tirón horizontal",
    "equipmentNeeded": "Barra",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "De pie, sosteniendo la barra frente a ti, agarre en pronación, manos separadas a la altura de los hombros. Levanta la barra verticalmente hasta la altura del pecho. Contrae por un momento, luego regresa a la posición inicial. Durante todo el movimiento, mantén la barra cerca del cuerpo y los codos más altos que las muñecas.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, elevar los hombros o abrir/cerrar demasiado los codos.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en molestias de hombro, codo o muñeca.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Barbell-Upright-Row_8a03db96-29ea-47df-b517-0b863f96b564_600x600.png?v=1612138684",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/bent-over-lateral-raise",
    "sourceGroup": "Hombros",
    "name": "Elevaciones posteriores para hombros \"pájaro\"",
    "description": "Ejercicio para deltoides y músculos del trapecio",
    "primaryMuscleGroup": "hombros",
    "secondaryMuscleGroups": [
      "músculos del trapecio"
    ],
    "movementPattern": "Patrón multiarticular de entrenamiento",
    "equipmentNeeded": "Mancuernas",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "De pie, con las rodillas ligeramente flexionadas, el pecho flexionado hacia adelante, casi paralelo al suelo, manteniendo la espalda recta y la cabeza alineada con la columna. Sostén una mancuerna en cada mano, con las palmas de las manos una frente a la otra. Eleva lentamente las mancuernas separándolas de cada lado del cuerpo haciendo un arco con los brazos. Contrae un momento en la posición elevada antes de volver a la posición inicial.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, elevar los hombros o abrir/cerrar demasiado los codos.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en molestias de hombro, codo o muñeca.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Bent-Over-Lateral-Raise_41bd4de4-0370-4e6b-9501-37cdcc26ded4_600x600.png?v=1621163232",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/cable-one-arm-lateral-raise",
    "sourceGroup": "Hombros",
    "name": "Elevación lateral con cable a una mano",
    "description": "Ejercicio para deltoides",
    "primaryMuscleGroup": "hombros",
    "secondaryMuscleGroups": [],
    "movementPattern": "Abducción de hombro",
    "equipmentNeeded": "Máquina de poleas",
    "equipmentType": "polea",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "De pie con los pies separados a la anchura de los hombros, el lado izquierdo junto a la polea. El asa en tu mano derecha, contra la parte delantera de tu muslo. Levanta lentamente tu brazo hacia el lado en un arco hacia la horizontal. Mantén el codo ligeramente doblado. Permanece en la posición elevada por un momento y luego vuelve lentamente a la posición original.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, elevar los hombros o abrir/cerrar demasiado los codos.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en molestias de hombro, codo o muñeca.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Cable-One-Arm-Lateral-Raise_3e57189f-cdf3-46ee-9a89-6ca054eae56a_600x600.png?v=1612138775",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/dumbbell-push-press",
    "sourceGroup": "Hombros",
    "name": "Press Militar con mancuernas",
    "description": "Ejercicio para deltoides y tríceps",
    "primaryMuscleGroup": "hombros",
    "secondaryMuscleGroups": [
      "tríceps"
    ],
    "movementPattern": "Empuje vertical",
    "equipmentNeeded": "Mancuernas",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH",
      "CORE"
    ],
    "technicalInstructions": "De pie con una mancuerna apoyada en cada hombro y los codos apuntando hacia delante. Los pies deben estar separados a la anchura de los hombros. Dobla ligeramente las rodillas y luego sube, empujando las mancuernas hacia arriba en el aire y terminando con los brazos extendidos por encima de la cabeza. Pausa, y luego vuelve a la posición inicial.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, elevar los hombros o abrir/cerrar demasiado los codos.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en molestias de hombro, codo o muñeca.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Dumbbell-Push-Press_f9229ee9-08e7-4aeb-8e41-ebd897e7ba8b_600x600.png?v=1621162780",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/barbell-push-press",
    "sourceGroup": "Hombros",
    "name": "Press Militar",
    "description": "Ejercicio para deltoides y tríceps",
    "primaryMuscleGroup": "hombros",
    "secondaryMuscleGroups": [
      "tríceps"
    ],
    "movementPattern": "Empuje vertical",
    "equipmentNeeded": "Mancuernas",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH",
      "CORE"
    ],
    "technicalInstructions": "De pie con una barra que descanse en la parte superior del pecho y con los hombros y los codos apuntando hacia delante. Los pies deben estar separados a la anchura de los hombros. Dobla ligeramente las rodillas y luego sube el peso, empujando la barra hacia arriba en el aire y terminando con los brazos extendidos por encima de la cabeza. Pausa, y luego vuelve a la posición inicial.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, elevar los hombros o abrir/cerrar demasiado los codos.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en molestias de hombro, codo o muñeca.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Barbell-Push-Press_8ba0542a-aba8-45ce-bdee-1a3eb4736514_600x600.png?v=1621162658",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/single-arm-cable-front-raise",
    "sourceGroup": "Hombros",
    "name": "Elevaciones frontales con cable a una mano",
    "description": "Ejercicio para deltoides anteriores",
    "primaryMuscleGroup": "hombros",
    "secondaryMuscleGroups": [],
    "movementPattern": "Patrón multiarticular de entrenamiento",
    "equipmentNeeded": "Asa de agarre, cable de polea baja",
    "equipmentType": "polea",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "De pie, con la espalda mirando hacia la máquina de cable y las rodillas ligeramente flexionadas. Agarra el asa con la mano por encima (en pronación), con el brazo a lo largo del cuerpo y el codo ligeramente doblado. Manteniendo el codo ligeramente flexionado, levanta lentamente el brazo hacia delante haciendo un arco. Una vez que el brazo esté paralelo al suelo aprieta brevemente los hombros, y luego vuelve lentamente a la posición inicial. Haz el número de repeticiones deseadas.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, elevar los hombros o abrir/cerrar demasiado los codos.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en molestias de hombro, codo o muñeca.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Single-Arm-Cable-Front-Raise_600x600.png?v=1619977928",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/barbell-front-raise",
    "sourceGroup": "Hombros",
    "name": "Elevaciones frontales con barra",
    "description": "Ejercicio para deltoides anteriores",
    "primaryMuscleGroup": "hombros",
    "secondaryMuscleGroups": [],
    "movementPattern": "Patrón multiarticular de entrenamiento",
    "equipmentNeeded": "Barra, discos",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "De pie, con los pies separados a la anchura de los hombros, los codos ligeramente flexionados, los brazos a lo largo del cuerpo, coge el asa con un agarre por encima de la mano (en pronación), las manos separadas a la anchura de los hombros. Levante lentamente los brazos hacia delante hasta que estén paralelos al suelo. Aprieta brevemente los hombros en la parte superior y luego vuelve lentamente a la posición inicial. Mantén la espalda recta durante todo el movimiento.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, elevar los hombros o abrir/cerrar demasiado los codos.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en molestias de hombro, codo o muñeca.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Barbell-Front-Raise_600x600.png?v=1619977846",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/seated-barbell-shoulder-press",
    "sourceGroup": "Hombros",
    "name": "Press militar sentado con barra",
    "description": "Ejercicio para deltoides y tríceps",
    "primaryMuscleGroup": "hombros",
    "secondaryMuscleGroups": [
      "tríceps"
    ],
    "movementPattern": "Empuje vertical",
    "equipmentNeeded": "Barra, discos, banco",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH",
      "CORE"
    ],
    "technicalInstructions": "Siéntate en el banco y desengancha la barra cogiéndola con un agarre en pronación y los codos apuntando hacia fuera. La barra se coloca por delante a la altura de la barbilla. Este nivel puede variar en función de la flexibilidad de tus hombros. La distancia entre las manos debe ser tal que los codos formen un ángulo de 90° cuando los brazos estén paralelos al suelo. Aprieta los hombros mientras empujas el peso verticalmente. Detén el movimiento cuando tus brazos estén a punto de estar completamente extendidos. A continuación, vuelve lentamente a la posición inicial.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, elevar los hombros o abrir/cerrar demasiado los codos.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en molestias de hombro, codo o muñeca.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Seated-Barbell-Shoulder-Press_600x600.png?v=1619977796",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/seated-behind-the-neck-barbell-shoulder-press",
    "sourceGroup": "Hombros",
    "name": "Press tras nuca sentado",
    "description": "Ejercicio para deltoides y tríceps",
    "primaryMuscleGroup": "hombros",
    "secondaryMuscleGroups": [
      "tríceps"
    ],
    "movementPattern": "Empuje vertical",
    "equipmentNeeded": "Barra, discos, banco",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH",
      "CORE"
    ],
    "technicalInstructions": "Siéntate en el banco con la espalda recta y el pecho hacia afuera. Desengancha la barra cogiéndola con un agarre superior (en pronación) y los codos apuntando hacia fuera. La barra debe situarse detrás de ti a la altura del cuello. Este nivel puede variar en función de la flexibilidad de tus hombros. La distancia entre las manos debe ser tal que los codos formen un ángulo de 90° cuando los brazos estén paralelos al suelo.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, elevar los hombros o abrir/cerrar demasiado los codos.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en molestias de hombro, codo o muñeca.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Seated-Behind-the-Neck-Barbell-Shoulder-Press_600x600.png?v=1619977737",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/standing-barbell-shoulder-press",
    "sourceGroup": "Hombros",
    "name": "Press militar de pie",
    "description": "Ejercicio para deltoides y tríceps",
    "primaryMuscleGroup": "hombros",
    "secondaryMuscleGroups": [
      "tríceps"
    ],
    "movementPattern": "Empuje vertical",
    "equipmentNeeded": "Barra, discos",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH",
      "CORE"
    ],
    "technicalInstructions": "De pie, con la espalda recta, el pecho hacia afuera, los pies separados a la anchura de los hombros y las rodillas ligeramente flexionadas. Toma la barra con un agarre en pronación y los codos apuntando hacia fuera. La barra debe estar a la altura de la barbilla. Este nivel puede variar en función de la flexibilidad de tus hombros. La distancia entre las manos debe ser tal que los codos formen un ángulo de 90° cuando los brazos estén paralelos al suelo. Aprieta los hombros mientras empujas el peso verticalmente. Detén el movimiento cuando tus brazos estén a punto de estar completamente extendidos. A continuación, vuelve lentamente a la posición inicial.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, elevar los hombros o abrir/cerrar demasiado los codos.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en molestias de hombro, codo o muñeca.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Standing-Barbell-Shoulder-Press_600x600.png?v=1619977694",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/standing-behind-the-neck-barbell-shoulder-press",
    "sourceGroup": "Hombros",
    "name": "Press militar de pie tras nuca",
    "description": "Ejercicio para deltoides y tríceps",
    "primaryMuscleGroup": "hombros",
    "secondaryMuscleGroups": [
      "tríceps"
    ],
    "movementPattern": "Empuje vertical",
    "equipmentNeeded": "Barra, discos",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH",
      "CORE"
    ],
    "technicalInstructions": "De pie, con la espalda recta, el pecho hacia afuera, los pies separados a la anchura de los hombros y las rodillas ligeramente flexionadas. Toma la barra con un agarre en pronación, con los codos apuntando hacia fuera. La barra debe situarse detrás de ti a la altura del cuello. Este nivel puede variar en función de la flexibilidad de tus hombros. La distancia entre las manos debe ser tal que los codos formen un ángulo de 90° cuando los brazos estén paralelos al suelo. Aprieta los hombros mientras empujas el peso verticalmente. Detén el movimiento cuando tus brazos estén a punto de estar completamente extendidos. A continuación, vuelve lentamente a la posición inicial.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, elevar los hombros o abrir/cerrar demasiado los codos.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en molestias de hombro, codo o muñeca.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Standing-Behind-the-Neck-Barbell-Shoulder-Press_600x600.png?v=1619977648",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/alternate-dumbbell-front-raise-neutral-grip",
    "sourceGroup": "Hombros",
    "name": "Elevación frontal con mancuernas alternas agarre neutro",
    "description": "Ejercicio para deltoides anteriores",
    "primaryMuscleGroup": "hombros",
    "secondaryMuscleGroups": [],
    "movementPattern": "Flexión de hombro",
    "equipmentNeeded": "Mancuernas",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "De pie, con los brazos a lo largo del cuerpo, los codos ligeramente flexionados, una mancuerna en cada mano, agarre neutro. Levanta lentamente un brazo hacia delante en forma de arco hasta que quede paralelo al suelo. Aprieta el deltoide anterior durante un momento y luego vuelve lentamente a la posición inicial. Haz lo mismo con el otro brazo. Mantén la espalda recta durante el ejercicio.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, elevar los hombros o abrir/cerrar demasiado los codos.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en molestias de hombro, codo o muñeca.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Alternate-Dumbbell-Front-Raise-Neutral-Grip_600x600.png?v=1619977407",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/one-arm-low-pulley-front-raise-neutral-grip",
    "sourceGroup": "Hombros",
    "name": "Elevación frontal con un brazo en polea baja agarre neutro",
    "description": "Ejercicio para deltoides anteriores",
    "primaryMuscleGroup": "hombros",
    "secondaryMuscleGroups": [],
    "movementPattern": "Flexión de hombro",
    "equipmentNeeded": "Polea baja",
    "equipmentType": "polea",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "De pie, de espaldas a la polea. Sujetando el extremo de la cuerda, la mano en agarre neutro, los brazos a lo largo del cuerpo, el codo ligeramente doblado. Manteniendo el codo ligeramente flexionado, levanta lentamente el brazo hacia delante en forma de arco. Una vez que el brazo esté paralelo al suelo, aprieta el deltoide anterior durante un momento y vuelve a la posición inicial. Mantén la espalda recta durante el ejercicio.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, elevar los hombros o abrir/cerrar demasiado los codos.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en molestias de hombro, codo o muñeca.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/One-Arm-Low-Pulley-Front-Raise-Neutral-Grip_600x600.png?v=1619977374",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/two-handed-dumbbell-front-raise",
    "sourceGroup": "Hombros",
    "name": "Elevación frontal con mancuerna a dos manos",
    "description": "Ejercicio para deltoides anteriores",
    "primaryMuscleGroup": "hombros",
    "secondaryMuscleGroups": [],
    "movementPattern": "Flexión de hombro",
    "equipmentNeeded": "Mancuerna",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "De pie, con los pies separados a la anchura de los hombros, los codos ligeramente flexionados, los brazos a lo largo del cuerpo, sujetando la mancuerna con ambas manos (como en la ilustración). Levanta lentamente los brazos hacia delante en forma de arco hasta que estén paralelos al suelo. Aprieta los deltoides durante un momento y luego vuelve lentamente a la posición inicial. Mantén la espalda recta durante el ejercicio.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, elevar los hombros o abrir/cerrar demasiado los codos.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en molestias de hombro, codo o muñeca.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Two-Handed-Dumbbell-Front-Raise_600x600.png?v=1619977326",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/barbell-curl",
    "sourceGroup": "Bíceps",
    "name": "Curl con barra",
    "description": "Ejercicio para bíceps",
    "primaryMuscleGroup": "bíceps",
    "secondaryMuscleGroups": [],
    "movementPattern": "Flexión de codo",
    "equipmentNeeded": "Barra",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "De pie, con las rodillas ligeramente dobladas y la espalda recta. Sostén la barra con las manos en supinación, a la anchura de los hombros. Sin mover el pecho, levanta la barra flexionando los antebrazos. Contrae los bíceps en la posición elevada y deja que la barra baje lentamente hasta la posición inicial. Mantén tus codos cerca del cuerpo durante el movimiento.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, mover el hombro para compensar.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Barbell-Curl_f38580d5-412e-4082-b453-5d319afa94fd_600x600.png?v=1612137128",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/alternating-dumbbell-curl",
    "sourceGroup": "Bíceps",
    "name": "Curl alterno con mancuernas",
    "description": "Ejercicio para bíceps",
    "primaryMuscleGroup": "bíceps",
    "secondaryMuscleGroups": [],
    "movementPattern": "Flexión de codo",
    "equipmentNeeded": "Mancuernas",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "De pie, con las rodillas ligeramente dobladas y la espalda recta. Sostén una mancuerna en cada mano, con un agarre neutral a lo largo del cuerpo. Sin mover el pecho, eleva la mancuerna flexionando el antebrazo. Durante el movimiento, rota la muñeca hacia afuera hasta que la mano esté en posición supina y recta. Contrae el bíceps, y luego vuelve lentamente a la posición inicial. Mantén el codo cerca del cuerpo durante el movimiento. Alterne este movimiento realizándolo con un brazo tras otro.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, mover el hombro para compensar.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Alternating-Dumbbell-Curl_ad879dc4-b4fb-4ca7-b2b1-6e1eb5d78252_600x600.png?v=1612137169",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/rope-cable-curl",
    "sourceGroup": "Bíceps",
    "name": "Curl con cuerda en polea",
    "description": "Ejercicio para bíceps",
    "primaryMuscleGroup": "bíceps",
    "secondaryMuscleGroups": [],
    "movementPattern": "Flexión de codo",
    "equipmentNeeded": "Máquina de poleas, cuerda",
    "equipmentType": "polea",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "De pie frente a la polea, rodillas ligeramente flexionadas, toma la cuerda con ambas manos, en un agarre neutral, brazos relajados a lo largo del cuerpo. Sin mover el pecho, flexiona los antebrazos, acercando las manos lo más posible a los hombros, sin llevar los codos demasiado hacia delante. Contrae los bíceps en una posición alta, y luego vuelve lentamente a la posición inicial.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, mover el hombro para compensar.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Rope-Cable-Curl_6216e254-5f77-462c-9954-ea210fff8a70_600x600.png?v=1612137195",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/ez-barbell-curl",
    "sourceGroup": "Bíceps",
    "name": "Curl con barra EZ",
    "description": "Ejercicio para bíceps",
    "primaryMuscleGroup": "bíceps",
    "secondaryMuscleGroups": [],
    "movementPattern": "Flexión de codo",
    "equipmentNeeded": "Barra EZ",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "De pie, con las rodillas ligeramente dobladas y la espalda recta. Sujeta la barra EZ con las manos en supinación. Sin mover el pecho, levantar la barra EZ flexionando los antebrazos. Contrae los bíceps en posición elevada, luego deja que la barra baje lentamente de nuevo hasta la posición inicial. Mantén tus codos cerca del cuerpo durante el movimiento.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, mover el hombro para compensar.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/EZ-Barbell-Curl_42cb566b-6415-4318-94e0-c93f4b442e59_600x600.png?v=1612137227",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/ez-barbell-preacher-curl",
    "sourceGroup": "Bíceps",
    "name": "Curl de predicador con barra EZ",
    "description": "Ejercicio para bíceps",
    "primaryMuscleGroup": "bíceps",
    "secondaryMuscleGroups": [],
    "movementPattern": "Flexión de codo",
    "equipmentNeeded": "Máquina de predicador, barra EZ",
    "equipmentType": "maquina",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "Sentado o de pie, ajusta el apoyabrazos de la máquina \"Larry Scott\" para que esté ligeramente por debajo del nivel de tus hombros. Apoya la parte superior de los brazos en el apoyabrazos y agarra la barra EZ con las manos en supinación. Lentamente flexiona los antebrazos hacia los hombros mientras mantienes la parte superior de los brazos presionados contra el apoyabrazos. Contrae tus bíceps en la posición de subida, y luego vuelve lentamente a la posición inicial. Ten cuidado de no extender completamente los antebrazos en la posición baja para evitar poner demasiada tensión en la articulación del codo.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, mover el hombro para compensar.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Ajustar la máquina para evitar trayectorias articulares forzadas.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/EZ-Barbell-Preacher-Curl_4d449fee-1920-4137-970c-75d4698b268d_600x600.png?v=1612137254",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/hammer-curl",
    "sourceGroup": "Bíceps",
    "name": "Curl alterno de martillo con mancuernas",
    "description": "Ejercicio para bíceps",
    "primaryMuscleGroup": "bíceps",
    "secondaryMuscleGroups": [],
    "movementPattern": "Flexión de codo",
    "equipmentNeeded": "Mancuernas",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "De pie, con las rodillas ligeramente dobladas y la espalda recta. Sujeta una mancuerna en cada mano, en un agarre neutral a lo largo del cuerpo. Sin mover el pecho, eleva la mancuerna doblando los antebrazos. Mantén tu mano en un agarre neutral (de ahí el nombre de agarre de martillo). Contrae los bíceps, y luego vuelve lentamente a la posición inicial. Mantén el codo cerca del cuerpo durante el movimiento. Alterne el movimiento realizándolo con un brazo tras otro.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, mover el hombro para compensar.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Hammer-Curl_da9fea8b-fc81-4a4f-9af1-aea1b85239d7_600x600.png?v=1612137282",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/incline-dumbbell-curl",
    "sourceGroup": "Bíceps",
    "name": "Curl inclinado con mancuernas",
    "description": "Ejercicio para bíceps",
    "primaryMuscleGroup": "bíceps",
    "secondaryMuscleGroups": [],
    "movementPattern": "Flexión de codo",
    "equipmentNeeded": "Mancuernas",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "Sentado en un banco con el respaldo inclinado en un ángulo de 40 a 60 grados. Deja que tus brazos cuelguen hacia el suelo. Sujeta una mancuerna en cada mano en supinación. Manteniendo la espalda bien apoyada en el respaldo, levanta una mancuerna flexionando el antebrazo hacia el hombro. Contrae los bíceps en la posición alta, y luego vuelve lentamente a la posición inicial. Mantén tu codo cerca de tu cuerpo durante el movimiento. Alterna este movimiento haciéndolo con un brazo y otro.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, mover el hombro para compensar.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Incline-Dumbbell-Curl_7debf468-cd34-49bc-8933-7f4b087e6cca_600x600.png?v=1612137309",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/dumbbell-concentration-curl",
    "sourceGroup": "Bíceps",
    "name": "Curl concentrado con mancuerna",
    "description": "Ejercicio para bíceps",
    "primaryMuscleGroup": "bíceps",
    "secondaryMuscleGroups": [],
    "movementPattern": "Flexión de codo",
    "equipmentNeeded": "Mancuernas, banco",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "Sentado en un banco, con una mancuerna en la mano derecha, en posición supina. El pecho ligeramente inclinado hacia adelante, apoyando el codo en la parte interna del muslo derecho, y dejando el brazo relajado hacia el suelo. Flexiona lentamente el antebrazo mientras llevas la mancuerna hacia tu hombro derecho. Contrae el bíceps en la posición alta, y luego vuelve lentamente a la posición inicial. Una vez que hayas completado la serie, pasa al otro brazo.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, mover el hombro para compensar.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Dumbbell-Concentration-Curl_289b5739-4bdd-40e6-a195-6ecfcc685126_600x600.png?v=1612137334",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/single-arm-low-pulley-cable-curl",
    "sourceGroup": "Bíceps",
    "name": "Curl de cable en polea baja a una mano",
    "description": "Ejercicio para bíceps",
    "primaryMuscleGroup": "bíceps",
    "secondaryMuscleGroups": [],
    "movementPattern": "Flexión de codo",
    "equipmentNeeded": "Un asa de agarre y un cable de polea baja",
    "equipmentType": "polea",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "Colócate frente a la máquina de cable y toma el asa con un agarre por debajo de la mano (supinado). Las rodillas deben estar ligeramente flexionadas y el brazo relajado a lo largo del cuerpo. Manteniendo el torso fijo, el codo metido en el costado y los ojos mirando al frente, sube lentamente el peso lo más posible sin dejar que el codo se mueva excesivamente hacia delante; sólo debe moverse el antebrazo. Aprieta el bíceps en la parte superior del movimiento y luego baja lentamente el peso hasta la posición inicial. Haz el número de repeticiones deseadas y luego repite con el otro brazo.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, mover el hombro para compensar.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Single-Arm-Low-Pulley-Cable-Curl_600x600.png?v=1619978525",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/straight-bar-low-pulley-cable-curl",
    "sourceGroup": "Bíceps",
    "name": "Curl de cable con barra recta en polea baja",
    "description": "Ejercicio para bíceps",
    "primaryMuscleGroup": "bíceps",
    "secondaryMuscleGroups": [],
    "movementPattern": "Flexión de codo",
    "equipmentNeeded": "Una barra recta y un cable de polea baja",
    "equipmentType": "polea",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "Colócate frente a la máquina de cable, con las piernas separadas a la anchura de los hombros, y coge la barra recta con un agarre inferior de la mano (supinado) y con las manos separadas a la anchura de los hombros. Manteniendo el cuerpo fijo, el codo metido en el costado y los ojos mirando al frente, sube lentamente el peso lo más posible sin dejar que el codo se mueva excesivamente hacia delante; sólo deben moverse los antebrazos. Aprieta los bíceps en la parte superior del movimiento y luego baja lentamente el peso hasta la posición inicial. Haz el ejercicio el número de repeticiones deseadas.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, mover el hombro para compensar.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Straight-Bar-Low-Pulley-Cable-Curl_600x600.png?v=1619978455",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/standing-high-pulley-cable-curl",
    "sourceGroup": "Bíceps",
    "name": "Curl de cable en polea alta de pie",
    "description": "Ejercicio para bíceps",
    "primaryMuscleGroup": "bíceps",
    "secondaryMuscleGroups": [],
    "movementPattern": "Flexión de codo",
    "equipmentNeeded": "Dos asas de agarre y dos cables de polea alta",
    "equipmentType": "polea",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "Toma cada uno de los cables con un agarre por debajo (supinado, con las palmas hacia arriba) y colócate en el centro con los brazos extendidos. Manteniendo la parte superior de los brazos y el cuerpo fijos, acerca simultáneamente las asas hacia la cabeza tanto como sea posible en un movimiento de curl. Aprieta los bíceps en la parte superior del movimiento, haz una pausa y luego baja lentamente el peso hasta la posición inicial. Haz el ejercicio el número de repeticiones deseadas.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, mover el hombro para compensar.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Standing-High-Pulley-Cable-Curl_600x600.png?v=1619978409",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/seated-barbell-wrist-curl",
    "sourceGroup": "Bíceps",
    "name": "Curl de muñeca con barra sentado",
    "description": "Ejercicio para antebrazos",
    "primaryMuscleGroup": "bíceps",
    "secondaryMuscleGroups": [],
    "movementPattern": "Flexión de codo",
    "equipmentNeeded": "Barra, discos, banco",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "Toma una barra con un agarre por debajo (supinado, con las palmas hacia arriba) y siéntate en el extremo de un banco plano. Apoya la parte posterior de los antebrazos en la parte superior de los muslos o en el extremo del banco, de manera que las muñecas queden justo al final de las rodillas o del banco. Sin mover los antebrazos, levanta lentamente las manos hacia arriba lo máximo posible apretando los músculos de los antebrazos en la parte superior del movimiento. Haz una pausa y luego baja lentamente la barra hasta la posición inicial. Repite el ejercicio el número de repeticiones deseadas.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, mover el hombro para compensar.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Seated-Barbell-Wrist-Curl_600x600.png?v=1619978365",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/seated-barbell-wrist-extension",
    "sourceGroup": "Bíceps",
    "name": "Extensión de muñeca con barra sentado",
    "description": "Ejercicio para antebrazos",
    "primaryMuscleGroup": "bíceps",
    "secondaryMuscleGroups": [],
    "movementPattern": "Extensión de codo",
    "equipmentNeeded": "Barra, discos, banco",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "Toma una barra con un agarre por encima de la mano (en pronación, con las palmas hacia abajo) y siéntate en el extremo de un banco plano. Apoya los antebrazos en la parte superior de los muslos o en el extremo del banco, de manera que las muñecas queden justo al final de las rodillas o del banco. Sin mover los antebrazos, levanta lentamente las manos hacia arriba lo máximo posible apretando los músculos de los antebrazos en la parte superior del movimiento. Haz una pausa y luego baja lentamente la barra hasta la posición inicial. Repite el ejercicio el número de repeticiones deseadas.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, mover el hombro para compensar.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Seated-Barbell-Wrist-Extension_600x600.png?v=1619978327",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/reverse-barbell-curl",
    "sourceGroup": "Bíceps",
    "name": "Curl de barra invertido",
    "description": "Ejercicio para bíceps y antebrazos",
    "primaryMuscleGroup": "bíceps",
    "secondaryMuscleGroups": [],
    "movementPattern": "Flexión de codo",
    "equipmentNeeded": "Barra recta o barra EZ, discos",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "De pie frente a la máquina de cable, con las rodillas ligeramente flexionadas y la espalda recta, agarra la barra recta o barra EZ con un agarre superior (en pronación) y con las manos separadas a la anchura de los hombros. Sin mover el torso, levanta lentamente los antebrazos lo más posible apretándolos en la parte superior del movimiento, haz una pausa y luego baja lentamente la barra hasta la posición inicial. Mantén los codos metidos durante todo el movimiento. Repite el ejercicio el número de repeticiones deseadas.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, mover el hombro para compensar.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Reverse-Barbell-Curl_600x600.png?v=1619978270",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/lying-triceps-extension",
    "sourceGroup": "Tríceps",
    "name": "Extensión de tríceps tumbado",
    "description": "Ejercicio para tríceps",
    "primaryMuscleGroup": "tríceps",
    "secondaryMuscleGroups": [],
    "movementPattern": "Extensión de codo",
    "equipmentNeeded": "Barra EZ, banco",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "Acostado en el banco, con los pies en el suelo o en el banco. Sostén la barra EZ sobre tu pecho, agarre en posición de pronación, las manos ligeramente más cerradas que el ancho de los hombros. Flexiona lentamente los antebrazos sin separar demasiado los codos, llevando la barra a la parte superior de la cabeza. Luego vuelve a la posición inicial.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, mover el hombro para compensar.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Lying-Triceps-Extension_4affa7a2-9c1c-48f8-8003-3570d7b3a39c_600x600.png?v=1612136744",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/triceps-pressdown",
    "sourceGroup": "Tríceps",
    "name": "Extensión de tríceps en polea",
    "description": "Ejercicio para tríceps",
    "primaryMuscleGroup": "tríceps",
    "secondaryMuscleGroups": [],
    "movementPattern": "Extensión de codo",
    "equipmentNeeded": "Barra EZ, banco",
    "equipmentType": "polea",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "De pie frente a la polea, agarrando la barra con un agarre de pronación, las manos separadas a la anchura de los hombros. Extender los antebrazos hasta que los brazos estén completamente extendidos. En esta posición, contrae tus tríceps durante un momento y luego vuelve lentamente a la posición inicial. Mantén los codos cerca del cuerpo durante todo el movimiento.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, mover el hombro para compensar.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Triceps-Pressdown_e759437b-6200-4b44-b484-14db770024a4_600x600.png?v=1612136845",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/cable-rope-puschdown",
    "sourceGroup": "Tríceps",
    "name": "Extensión de tríceps en polea con cuerda",
    "description": "Ejercicio para tríceps",
    "primaryMuscleGroup": "tríceps",
    "secondaryMuscleGroups": [],
    "movementPattern": "Extensión de codo",
    "equipmentNeeded": "Máquina de poleas, cuerda",
    "equipmentType": "polea",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "De pie frente a la polea, agarrar un extremo de la cuerda en cada mano con un agarre neutral. Extiende los antebrazos separando ligeramente los extremos de la cuerda hasta que los brazos estén completamente extendidos. En esta posición, contrae tus tríceps por un momento y luego regresa lentamente a la posición inicial. Mantén los codos cerca del cuerpo durante todo el movimiento.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, mover el hombro para compensar.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Cable-Rope-Pushdown_600x600.png?v=1612136916",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/dumbbell-overhead-triceps-extension",
    "sourceGroup": "Tríceps",
    "name": "Extensión de tríceps con mancuernas por encima de la cabeza",
    "description": "Ejercicio para tríceps",
    "primaryMuscleGroup": "tríceps",
    "secondaryMuscleGroups": [],
    "movementPattern": "Extensión de codo",
    "equipmentNeeded": "Mancuerna, banco",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "Sentado en un banco, con la espalda recta, agarrando una mancuerna con ambas manos, las palmas de las manos en el interior de un disco (ver foto). Coloca la mancuerna sobre la cabeza, brazos extendidos, tríceps bien contraídos. Baja los antebrazos por detrás de la cabeza hasta que los codos formen un ángulo de 90°. Luego extiende los antebrazos, volviendo a la posición inicial.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, mover el hombro para compensar.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Dumbbell-Overhead-Triceps-Extension_99242f13-ab4d-4e77-be12-e0f180cc93ac_600x600.png?v=1612136962",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/close-grip-bench-press",
    "sourceGroup": "Tríceps",
    "name": "Press banca con agarre cerrado",
    "description": "Ejercicio para tríceps, pectorales y deltoides anteriores",
    "primaryMuscleGroup": "tríceps",
    "secondaryMuscleGroups": [
      "pecho",
      "hombros"
    ],
    "movementPattern": "Empuje horizontal",
    "equipmentNeeded": "Barra, banco",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "Tumbado en el banco, con los pies en el suelo. Agarra la barra con un agarre de pronación, las manos ligeramente más juntas que el ancho de los hombros. Saca la barra y bájala lentamente hasta la parte inferior de tus pectorales. Luego empuja la carga hacia arriba hasta que tus brazos estén rectos. Durante todo el movimiento: - Mantén los codos pegados al cuerpo para ejercer la máxima tensión en el tríceps y proteger la articulación del codo. - Mantén los hombros pegados al banco.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Close-Grip-Bench-Press_28c01bfb-504d-43a6-8264-bd2101d317b9_600x600.png?v=1612137028",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/kickback",
    "sourceGroup": "Tríceps",
    "name": "Patadas traseras",
    "description": "Ejercicio para tríceps",
    "primaryMuscleGroup": "tríceps",
    "secondaryMuscleGroups": [],
    "movementPattern": "Extensión de cadera",
    "equipmentNeeded": "Mancuerna, banco",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "Coloca tu rodilla izquierda y tu mano izquierda en un banco, con el pecho paralelo al suelo. Mantén el pie derecho en el suelo y agarra la mancuerna con la mano derecha. Manteniéndola cerca de tu cuerpo, levanta la parte superior de tu brazo derecho hasta que esté paralelo al suelo. Realiza una extensión del brazo derecho. Cuando esté completamente extendido, contrae tu tríceps por un momento antes de volver a la posición inicial. Una vez que hayas completado tu serie, haz lo mismo con el otro brazo.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Kickback_c8df8485-ed16-4808-96c0-7ccc27a0bec2_600x600.png?v=1612136991",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/reverse-grip-cable-triceps-extension-with-barbell",
    "sourceGroup": "Tríceps",
    "name": "Extensión de tríceps con cable de agarre inverso con barra",
    "description": "Ejercicio para tríceps",
    "primaryMuscleGroup": "tríceps",
    "secondaryMuscleGroups": [],
    "movementPattern": "Extensión de codo",
    "equipmentNeeded": "Barra recta, cable de polea alta",
    "equipmentType": "polea",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "Colócate frente a la máquina de cable y agarra la barra recta con un agarre por debajo de la mano (supinado, con las palmas hacia arriba), las manos separadas a la anchura de los hombros, y los codos metidos y doblados en un ángulo un poco menor de 90°. Extiende los antebrazos hasta que tus brazos estén completamente estirados. En esta posición, aprieta los tríceps, haz una pausa y vuelve lentamente a la posición inicial. Mantén los codos metidos durante todo el movimiento. Repite el ejercicio el número de repeticiones deseadas.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, mover el hombro para compensar.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Reverse-Grip-Cable-Triceps-Extension-with-Barbell_600x600.png?v=1619978215",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/single-arm-cable-triceps-extension",
    "sourceGroup": "Tríceps",
    "name": "Extensión de tríceps con cable a una mano",
    "description": "Ejercicio para tríceps",
    "primaryMuscleGroup": "tríceps",
    "secondaryMuscleGroups": [],
    "movementPattern": "Extensión de codo",
    "equipmentNeeded": "Asa de agarre, cable de polea alta",
    "equipmentType": "polea",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "Colócate frente a la máquina de cable y coge el asa con un agarre superior (en pronación, con la palma de la mano hacia abajo), los codos metidos y doblados en un ángulo un poco menor de 90°. Extiende los antebrazos hasta que tu brazo esté completamente estirado. En esta posición, aprieta los tríceps, haz una pausa y vuelve lentamente a la posición inicial. Mantén los codos metidos durante todo el movimiento. Realiza el número de repeticiones deseadas y luego repite con el otro brazo.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, mover el hombro para compensar.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Single-Arm-Cable-Triceps-Extension_600x600.png?v=1619978169",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/single-arm-cable-triceps-extension-with-supinated-grip",
    "sourceGroup": "Tríceps",
    "name": "Extensión de tríceps con cable a una mano con agarre supinado",
    "description": "Ejercicio para tríceps",
    "primaryMuscleGroup": "tríceps",
    "secondaryMuscleGroups": [],
    "movementPattern": "Extensión de codo",
    "equipmentNeeded": "Asa de agarre, cable de polea alta",
    "equipmentType": "polea",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "Colócate frente a la máquina de cable y toma el asa con un agarre por debajo (supinado, con la palma de la mano hacia arriba), los codos metidos y doblados en un ángulo un poco menor de 90°. Extiende los antebrazos hasta que tu brazo esté completamente estirado. En esta posición, aprieta los tríceps, haz una pausa y vuelve lentamente a la posición inicial. Mantén los codos metidos durante todo el movimiento. Haz el número de repeticiones deseadas y luego repite con el otro brazo.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, mover el hombro para compensar.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Single-Arm-Cable-Triceps-Extension-with-Supinated-Grip_600x600.png?v=1619978117",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/lying-dumbbell-triceps-extension",
    "sourceGroup": "Tríceps",
    "name": "Extensión de tríceps con mancuernas tumbado",
    "description": "Ejercicio para tríceps",
    "primaryMuscleGroup": "tríceps",
    "secondaryMuscleGroups": [],
    "movementPattern": "Extensión de codo",
    "equipmentNeeded": "Mancuernas, banco",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "Túmbate en el banco con los pies apoyados en el suelo o en el banco. Coge una mancuerna en cada mano con un agarre neutro (palmas mirándose) con los brazos extendidos por encima del pecho. Baja lentamente los antebrazos, manteniendo los codos metidos lo más posible, hasta que lleguen a la frente. A continuación, vuelve lentamente a la posición inicial. Haz el número de repeticiones deseadas.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, mover el hombro para compensar.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Lying-Dumbbell-Triceps-Extension_600x600.png?v=1619978076",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/seated-barbell-french-press",
    "sourceGroup": "Tríceps",
    "name": "Press francés sentado con barra",
    "description": "Ejercicio para tríceps",
    "primaryMuscleGroup": "tríceps",
    "secondaryMuscleGroups": [],
    "movementPattern": "Patrón multiarticular de entrenamiento",
    "equipmentNeeded": "Barra recta o barra EZ, discos, banco",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "Siéntate en un banco vertical, con la espalda apoyada en el respaldo, y toma una barra recta o una barra EZ con las manos ligeramente separadas a la anchura de los hombros. La barra debe estar por encima de tu cabeza con los brazos extendidos y los tríceps apretados. Baja lentamente los antebrazos más allá de la cabeza hasta que los codos formen un ángulo de 90°. A continuación, vuelve lentamente a la posición inicial y aprieta los tríceps en la parte superior. Mantén la espalda recta durante todo el movimiento. Haz el número de repeticiones deseadas.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Seated-Barbell-French-Press_600x600.png?v=1619978038",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/bench-dips",
    "sourceGroup": "Tríceps",
    "name": "Fondos en banco",
    "description": "Ejercicio para tríceps y deltoides anterior",
    "primaryMuscleGroup": "tríceps",
    "secondaryMuscleGroups": [],
    "movementPattern": "Extensión de codo",
    "equipmentNeeded": "Dos bancos",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "Coloca dos bancos planos, paralelos entre sí, a una distancia similar a la longitud de las piernas para realizar los fondos. Manteniendo la espalda recta y los brazos extendidos, coloca las manos en el borde de uno de los bancos a la anchura de los hombros y apoya los talones en el borde del otro banco, con las piernas y los glúteos balanceándose en el aire (ver imagen). Mientras mantienes los codos metidos, flexiónalos lentamente hasta que formen un ángulo de 90º. A continuación, vuelve lentamente a la posición inicial y aprieta los tríceps en la parte superior. Mantén la espalda recta durante todo el movimiento. Haz el número de repeticiones deseadas.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, mover el hombro para compensar.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Bench-Dips_600x600.png?v=1619977992",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/parallel-dip-bar",
    "sourceGroup": "Tríceps",
    "name": "Fondos en barras paralelas",
    "description": "Ejercicio para tríceps, deltoides anteriores y pectorales inferiores",
    "primaryMuscleGroup": "tríceps",
    "secondaryMuscleGroups": [],
    "movementPattern": "Extensión de codo",
    "equipmentNeeded": "Barras paralelas",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "Agarra las dos barras paralelas, con los brazos extendidos a lo largo del torso y las rodillas flexionadas y oscilando en el aire (ver imagen). Manteniendo los codos hacia dentro, flexiónalos lentamente hasta que formen un ángulo de 90°. A continuación, vuelve lentamente a la posición inicial y aprieta los tríceps en lo más alto. No te inclines hacia delante para evitar la tensión en los pectorales. Haz el número de repeticiones deseadas.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, mover el hombro para compensar.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Parallel-Dip-Bar_600x600.png?v=1619977962",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/crunch",
    "sourceGroup": "Abdominales",
    "name": "Crunch",
    "description": "Ejercicio para abdominales",
    "primaryMuscleGroup": "abdomen/core",
    "secondaryMuscleGroups": [],
    "movementPattern": "Flexión o estabilización de tronco",
    "equipmentNeeded": "Peso corporal",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH",
      "CORE",
      "ENDURANCE"
    ],
    "technicalInstructions": "Tumbado en el suelo sobre la espalda con las rodillas dobladas y los pies apoyados en el suelo. Puedes poner las manos detrás de la cabeza o sobre el pecho. Encoge los abdominales levantando los hombros y la parte superior de la espalda hacia las rodillas. Mantén la parte inferior de la espalda apoyada en el suelo. Quédate en posición vertical por un segundo, y luego vuelve lentamente a la posición original.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, tirar del cuello o arquear la zona lumbar.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar, embarazo o diástasis sin indicación profesional.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Crunch_f3498d5d-82d9-4a7f-8dee-98a2e55a62f2_600x600.png?v=1612138317",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/oblique-crunch",
    "sourceGroup": "Abdominales",
    "name": "Crunch oblicuo",
    "description": "Ejercicio para abdominales",
    "primaryMuscleGroup": "abdomen/core",
    "secondaryMuscleGroups": [],
    "movementPattern": "Flexión o estabilización de tronco",
    "equipmentNeeded": "Peso corporal",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH",
      "CORE",
      "ENDURANCE"
    ],
    "technicalInstructions": "Acostado en el suelo del lado derecho con las rodillas dobladas. Pon tu mano izquierda detrás de la cabeza y tu mano derecha en los abdominales para sentirlos trabajar. Contrae los oblicuos del lado izquierdo levantando el hombro hacia la cadera. Mantente en posición vertical por un segundo y luego vuelve lentamente a la posición original.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, tirar del cuello o arquear la zona lumbar.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar, embarazo o diástasis sin indicación profesional.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Oblique-Crunch_253d0361-395d-443b-8228-aff440c1eee9_600x600.png?v=1612138354",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/crunch-machine",
    "sourceGroup": "Abdominales",
    "name": "Abdominales en máquina",
    "description": "Ejercicio para abdominales",
    "primaryMuscleGroup": "abdomen/core",
    "secondaryMuscleGroups": [],
    "movementPattern": "Flexión o estabilización de tronco",
    "equipmentNeeded": "Máquina de crunch",
    "equipmentType": "maquina",
    "goals": [
      "STRENGTH",
      "CORE",
      "ENDURANCE"
    ],
    "technicalInstructions": "Sentado en la máquina sujetando las asas. Contrae los abdominales y permanece en esa posición un momento antes de volver lentamente a la posición inicial.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, tirar del cuello o arquear la zona lumbar.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar, embarazo o diástasis sin indicación profesional.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Crunch-Machine_538b22a3-379f-4a45-874a-ec1d798235b4_600x600.png?v=1612138379",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/rope-ab-pulldown",
    "sourceGroup": "Abdominales",
    "name": "Abdominales con cuerda en polea alta",
    "description": "Ejercicio para abdominales",
    "primaryMuscleGroup": "abdomen/core",
    "secondaryMuscleGroups": [],
    "movementPattern": "Flexión o estabilización de tronco",
    "equipmentNeeded": "Máquina de poleas, cuerda",
    "equipmentType": "polea",
    "goals": [
      "STRENGTH",
      "CORE",
      "ENDURANCE"
    ],
    "technicalInstructions": "De rodillas en el suelo de cara a la polea alta. Coge un extremo de la cuerda en cada mano y llévalos a la altura de tu cabeza. Mantén las manos en esta posición durante el movimiento. Dobla el torso de manera que esté casi paralelo al suelo. Contrae los abdominales llevando los codos hacia las rodillas. Permanece en la posición de contracción por un momento antes de volver lentamente a la posición inicial.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, tirar del cuello o arquear la zona lumbar.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar, embarazo o diástasis sin indicación profesional.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Rope-Ab-Pulldown_b808db26-a4f3-4018-8007-5e31da5736dc_600x600.png?v=1612138402",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/plank",
    "sourceGroup": "Abdominales",
    "name": "Plancha",
    "description": "Ejercicio para abdominales",
    "primaryMuscleGroup": "abdomen/core",
    "secondaryMuscleGroups": [],
    "movementPattern": "Antiextensión de tronco",
    "equipmentNeeded": "Peso corporal",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH",
      "CORE",
      "ENDURANCE"
    ],
    "technicalInstructions": "Tumbado boca abajo en el suelo. Equilíbrate sobre los antebrazos y los dedos de los pies, manteniendo los hombros y los glúteos a la misma altura. Mantén esta posición por el tiempo que desees mientras contraes tus abdominales.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, tirar del cuello o arquear la zona lumbar.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar, embarazo o diástasis sin indicación profesional.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Plank_3a82d566-9cb2-4c20-b301-bc8bd635c4d1_600x600.png?v=1612138431",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/hanging-leg-raise",
    "sourceGroup": "Abdominales",
    "name": "Elevación de piernas",
    "description": "Ejercicio para abdominales",
    "primaryMuscleGroup": "abdomen/core",
    "secondaryMuscleGroups": [],
    "movementPattern": "Flexión o estabilización de tronco",
    "equipmentNeeded": "Peso corporal",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH",
      "CORE",
      "ENDURANCE"
    ],
    "technicalInstructions": "Colgando de una barra alta, las manos en pronación. Contrae los abdominales moviendo las rodillas y las caderas hacia el pecho. Mantente en posición alta por un segundo, y luego regresa lentamente a la posición inicial.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, tirar del cuello o arquear la zona lumbar.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar, embarazo o diástasis sin indicación profesional.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Hanging-Leg-Raise_36986393-d0a6-494a-981f-4ea06a99b0b5_600x600.png?v=1612138457",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/bent-knee-reverse-crunch",
    "sourceGroup": "Abdominales",
    "name": "Encogimientos de rodillas para abdominales",
    "description": "Ejercicio para abdominales",
    "primaryMuscleGroup": "abdomen/core",
    "secondaryMuscleGroups": [],
    "movementPattern": "Flexión o estabilización de tronco",
    "equipmentNeeded": "Peso corporal",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH",
      "CORE",
      "ENDURANCE"
    ],
    "technicalInstructions": "Acuéstate de espaldas con las rodillas dobladas y los pies apoyados en el suelo. Pon tus brazos en el suelo a cada lado, y prepara tus abdominales. Contrayendo tus abdominales, dirige las rodillas hacia el pecho describiendo un arco en circulo al mismo tiempo que elevas ligeramente las caderas del suelo. Haz una pausa, y luego vuelve a la posición inicial. Justo antes de que tus pies toquen el suelo, repite el movimiento.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, tirar del cuello o arquear la zona lumbar.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar, embarazo o diástasis sin indicación profesional.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Bent-Knee-Reverse-Crunch_600x600.png?v=1621163012",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/long-arm-crunch",
    "sourceGroup": "Abdominales",
    "name": "Abdominales con brazos estirados",
    "description": "Ejercicio para abdominales",
    "primaryMuscleGroup": "abdomen/core",
    "secondaryMuscleGroups": [],
    "movementPattern": "Flexión o estabilización de tronco",
    "equipmentNeeded": "Peso corporal",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH",
      "CORE",
      "ENDURANCE"
    ],
    "technicalInstructions": "Acostado sobre la espalda con las rodillas dobladas y los pies apoyados en el suelo. Pon tus brazos sobre la cabeza con los codos alineados con las orejas. Puedes entrelazar los pulgares si te resulta más fácil. Manteniendo los codos en línea con las orejas durante todo el movimiento, levanta el pecho y los hombros del suelo. Haz una pausa, y luego baja lentamente de nuevo.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, tirar del cuello o arquear la zona lumbar.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar, embarazo o diástasis sin indicación profesional.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Long-Arm-Crunch_f0e219dc-514f-411f-ad0d-0cdf02a93d41_600x600.png?v=1621163062",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/plank-get-ups",
    "sourceGroup": "Abdominales",
    "name": "Plancha con flexión",
    "description": "Ejercicio para abdominales",
    "primaryMuscleGroup": "abdomen/core",
    "secondaryMuscleGroups": [
      "tríceps",
      "hombros"
    ],
    "movementPattern": "Antiextensión de tronco",
    "equipmentNeeded": "Peso corporal",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH",
      "CORE",
      "ENDURANCE"
    ],
    "technicalInstructions": "Ponte en la posición estándar de flexión. Pies juntos, palmas de las manos en el suelo (a la anchura de los hombros). Prepara los abdominales y mantén la espalda recta. Baja lentamente el brazo derecho hasta que el antebrazo esté plano en el suelo, luego baja el brazo izquierdo. Una vez que ambos antebrazos estén en el suelo, inmediatamente levanta tu brazo derecho a una posición de empuje hacia arriba seguido por el izquierdo. Todo esto debe hacerse en un movimiento suave, para que estés constantemente en movimiento.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, tirar del cuello o arquear la zona lumbar.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar, embarazo o diástasis sin indicación profesional.",
    "imageUrl": null,
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/squat",
    "sourceGroup": "Piernas",
    "name": "Sentadilla",
    "description": "Ejercicio para músculos de los muslos, los glúteos, abdominales y lumbares",
    "primaryMuscleGroup": "cuádriceps",
    "secondaryMuscleGroups": [
      "abdomen/core"
    ],
    "movementPattern": "Sentadilla",
    "equipmentNeeded": "Barra",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH",
      "CORE"
    ],
    "technicalInstructions": "De pie con la barra apoyada en el trapecio y los hombros. Toma la barra con las manos para un buen apoyo. Mantén la cabeza recta. Dobla las rodillas y las caderas como si estuvieras sentado. Mientras mantienes la espalda recta, deja que los glúteos vayan hacia atrás, lo que hará que el pecho se incline ligeramente hacia delante para que el movimiento sea lo más natural posible. En el momento en que los muslos estén paralelos al suelo, muévete hacia arriba, realizando el movimiento en la dirección opuesta. Dada la complejidad de este movimiento, pídele a un entrenador en tu gimnasio que te muestre cómo realizarlo correctamente la primera vez.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, colapsar rodillas o perder columna neutra.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar, rodilla o cadera.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Squat_d752e42d-02ba-4692-b300-c6e67ad5a4f5_600x600.png?v=1612138811",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/leg-press",
    "sourceGroup": "Piernas",
    "name": "Prensa de piernas",
    "description": "Ejercicio para músculos de los muslos y los glúteos",
    "primaryMuscleGroup": "cuádriceps",
    "secondaryMuscleGroups": [],
    "movementPattern": "Patrón multiarticular de entrenamiento",
    "equipmentNeeded": "Máquina de prensa de piernas",
    "equipmentType": "maquina",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "Sentado en el banco de la prensa, con los pies planos en la plataforma y los hombros separados. Suelta el seguro manual y baja lentamente la carga llevando las rodillas hacia el pecho. Cuando las rodillas estén en un ángulo de 90°, haz una pausa momentánea y luego sube lentamente el peso. Para proteger las rodillas, detén el movimiento justo antes de que las piernas estén completamente extendidas. Durante el movimiento, no levantes los glúteos del banco.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, colapsar rodillas o perder columna neutra.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar, rodilla o cadera.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Leg-Press_f7febd5c-75e5-42f4-9bb4-c938969ce293_600x600.png?v=1612138836",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/leg-extension",
    "sourceGroup": "Piernas",
    "name": "Extensión de piernas",
    "description": "Ejercicio para cuádriceps",
    "primaryMuscleGroup": "cuádriceps",
    "secondaryMuscleGroups": [],
    "movementPattern": "Extensión de rodilla",
    "equipmentNeeded": "Máquina de extensión de piernas",
    "equipmentType": "maquina",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "Ajusta la máquina de extensión de piernas de manera que cuando te sientes, tus rodillas estén al borde del banco y tus tobillos justo debajo del reposapiés. Siéntate con la espalda bien apoyada en el respaldo, sosteniendo las asas a los lados. Extiende las piernas hasta que estén completamente extendidas. Aguanta la carga un momento contrayendo los cuádriceps, y luego vuelve a la posición baja.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, colapsar rodillas o perder columna neutra.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar, rodilla o cadera.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Leg-Extension_41d91d3f-4b9c-4374-82e2-1d697ce35fe4_600x600.png?v=1612138862",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/lunge",
    "sourceGroup": "Piernas",
    "name": "Zancada",
    "description": "Ejercicio para músculos de los glúteos y los muslos",
    "primaryMuscleGroup": "cuádriceps",
    "secondaryMuscleGroups": [],
    "movementPattern": "Zancada",
    "equipmentNeeded": "Mancuernas",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH",
      "CORE"
    ],
    "technicalInstructions": "De pie con las piernas separadas a la anchura de la cadera, una mancuerna en cada mano. Manteniendo el pecho recto, das un paso adelante y desciendes lentamente hasta que el muslo delantero esté paralelo al suelo. Luego vuelve a la posición original. Una vez que hayas completado tu serie, haz lo mismo con la otra pierna.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, colapsar rodillas o perder columna neutra.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar, rodilla o cadera.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Lunge_600x600.png?v=1612138903",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/lying-leg-curl",
    "sourceGroup": "Piernas",
    "name": "Curl de pierna tumbado en máquina de femoral",
    "description": "Ejercicio para isquios y gemelos",
    "primaryMuscleGroup": "isquiosurales",
    "secondaryMuscleGroups": [
      "gemelos"
    ],
    "movementPattern": "Patrón multiarticular de entrenamiento",
    "equipmentNeeded": "Máquina de femoral",
    "equipmentType": "maquina",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "Túmbate boca abajo en la máquina de \"curl de piernas tumbado\" con la parte trasera de los tobillos presionando el reposapiés. Agarra las asas. Apoyado firmemente en el banco, flexiona las piernas lo máximo posible. Mantén la carga por un momento en la posición alta contrayendo los músculos isquiotibiales, luego vuelve lentamente a la posición inicial.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, colapsar rodillas o perder columna neutra.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar, rodilla o cadera.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Lying-Leg-Curl_203153d8-79dd-4bb9-9125-708aa4327107_600x600.png?v=1612139013",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/hack-squat",
    "sourceGroup": "Piernas",
    "name": "Sentadilla Hack",
    "description": "Ejercicio para músculos de los glúteos y los muslos",
    "primaryMuscleGroup": "cuádriceps",
    "secondaryMuscleGroups": [],
    "movementPattern": "Sentadilla",
    "equipmentNeeded": "Máquina de la sentadilla Hack",
    "equipmentType": "maquina",
    "goals": [
      "STRENGTH",
      "CORE"
    ],
    "technicalInstructions": "De pie en la máquina de \" hack\", trapecios bajo las almohadillas, pies apoyados en el reposapiés, separados a la anchura de los hombros. Suelta el seguro manual y dobla lentamente las rodillas. Cuando las rodillas estén en un ángulo de 90°, haz una pausa durante un momento y luego levanta lentamente la carga. Mantén la espalda apoyada firmemente en el respaldo. Para proteger las rodillas, en la posición alta, detén el movimiento justo antes de que tus piernas estén completamente extendidas.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, colapsar rodillas o perder columna neutra.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar, rodilla o cadera.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Hack-Squat_044b3d09-ffa7-4728-b56f-f4fb3c175548_600x600.png?v=1612139060",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/seated-leg-curl",
    "sourceGroup": "Piernas",
    "name": "Curl de piernas sentado",
    "description": "Ejercicio para isquios y gemelos",
    "primaryMuscleGroup": "isquiosurales",
    "secondaryMuscleGroups": [
      "gemelos"
    ],
    "movementPattern": "Patrón multiarticular de entrenamiento",
    "equipmentNeeded": "Máquina de curl de piernas sentado",
    "equipmentType": "maquina",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "Ajusta la máquina de curl de piernas de manera que cuando estés sentado, la parte inferior de tus rodillas estén en el borde del banco y la parte posterior de tus tobillos estén justo más allá del reposapiés. Siéntate con la espalda bien apoyada en el respaldo, sosteniendo las asas a los lados. Dobla las piernas tanto como sea posible. Mantén el peso por un momento en esta posición contrayendo los músculos isquiales, y luego vuelve a la posición inicial.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, colapsar rodillas o perder columna neutra.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar, rodilla o cadera.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Seated-Leg-Curl_e367789a-bbb3-4144-a926-5a9b42afc278_600x600.png?v=1612139123",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/single-leg-extension",
    "sourceGroup": "Piernas",
    "name": "Extensión a una pierna",
    "description": "Ejercicio para cuádriceps",
    "primaryMuscleGroup": "cuádriceps",
    "secondaryMuscleGroups": [],
    "movementPattern": "Extensión de codo",
    "equipmentNeeded": "Máquina de extensión de piernas",
    "equipmentType": "maquina",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "Ajustar la máquina de extensión de piernas de manera que cuando te sientes, tu rodilla esté en el borde del banco y tu tobillo justo debajo del reposapiés. Siéntate con la espalda bien apoyada en el respaldo, sosteniendo las asas a los lados. Extiende tu pierna hasta que esté completamente extendida. Mantén el peso por un momento en la posición alta contrayendo los cuádriceps, y luego vuelve a la posición inferior. Una vez que hayas completado la serie, haz lo mismo con la otra pierna.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, colapsar rodillas o perder columna neutra, mover el hombro para compensar.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar, rodilla o cadera.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Single-Leg-Extension_9cf850d1-0b9b-4fb3-8caf-49d438e86db0_600x600.png?v=1612139177",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/front-squat",
    "sourceGroup": "Piernas",
    "name": "Sentadilla frontal",
    "description": "Ejercicio para piernas y músculos de los glúteos",
    "primaryMuscleGroup": "cuádriceps",
    "secondaryMuscleGroups": [],
    "movementPattern": "Sentadilla",
    "equipmentNeeded": "Barra",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH",
      "CORE"
    ],
    "technicalInstructions": "De pie, con la barra apoyada en la parte superior del pecho y los deltoides. Agarra la barra con las manos para un buen apoyo. Mantén la cabeza recta. Dobla las rodillas y las caderas como si estuvieras sentado. Mientras mantienes la espalda recta, deja que las nalgas vayan hacia atrás, lo que inclinará el pecho ligeramente hacia delante para que el movimiento sea lo más natural posible. En el momento en que los muslos estén paralelos al suelo, muévete hacia arriba, haciendo el movimiento en la dirección opuesta. Dada la complejidad de este movimiento, pídele a un entrenador en tu gimnasio que te muestre cómo realizarlo correctamente la primera vez.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, colapsar rodillas o perder columna neutra.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar, rodilla o cadera.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Front-Squat_600x600.png?v=1612049397",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/dumbbell-stiff-leg-deadlift",
    "sourceGroup": "Piernas",
    "name": "Peso muerto rumano (piernas rectas) con mancuernas",
    "description": "Ejercicio para piernas, músculos de los glúteos y músculos de la espalda baja",
    "primaryMuscleGroup": "isquiosurales",
    "secondaryMuscleGroups": [],
    "movementPattern": "Bisagra de cadera",
    "equipmentNeeded": "Mancuernas",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH",
      "CORE"
    ],
    "technicalInstructions": "De pie con los pies separados a la anchura de los hombros y los dedos de los pies mirando hacia adelante. Dobla las rodillas ligeramente y empuja el pecho hacia afuera. Sujeta una mancuerna en cada mano, apoyada en la parte superior de los muslos. Manteniendo las piernas rígidas, inclínate hacia adelante y baja las pesas hacia el suelo. Haz una pausa cuando los tendones de la corva estén tensos, y luego vuelve a la posición inicial. Manén la espalda recta y los hombros hacia atrás en todo momento.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, colapsar rodillas o perder columna neutra.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar, rodilla o cadera.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Dumbbell-Romanian-Deadlift_35135213-e0df-4ef2-b093-22ed8d04dc41_600x600.png?v=1621162896",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/barbell-stiff-leg-deadlift",
    "sourceGroup": "Piernas",
    "name": "Peso muerto rumano (piernas rectas) con barra",
    "description": "Ejercicio para piernas, músculos de los glúteos y músculos de la espalda baja",
    "primaryMuscleGroup": "isquiosurales",
    "secondaryMuscleGroups": [],
    "movementPattern": "Bisagra de cadera",
    "equipmentNeeded": "Barra",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH",
      "CORE"
    ],
    "technicalInstructions": "De pie con los pies separados a la anchura de los hombros y los dedos de los pies mirando hacia adelante. Dobla las rodillas ligeramente y empuja el pecho hacia afuera. Agarra una barra que descanse en la parte superior de los muslos, con las manos en pronación a la anchura de los hombros. Manteniendo las piernas rígidas, inclínate hacia adelante y baja el peso hacia el suelo. Haz una pausa cuando los isquiotibiales estén tensos, y luego vuelve a la posición inicial. Mantén la espalda recta y los hombros hacia atrás en todo momento.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, colapsar rodillas o perder columna neutra.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar, rodilla o cadera.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Barbell-Romanian-Deadlift_34ede1b4-63ac-451d-9536-bbf9942b560c_600x600.png?v=1621162957",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/dumbbell-goblet-squat",
    "sourceGroup": "Piernas",
    "name": "Sentadilla Goblet con mancuerna",
    "description": "Ejercicio para glúteos, isquiotibiales y cuádriceps",
    "primaryMuscleGroup": "isquiosurales",
    "secondaryMuscleGroups": [],
    "movementPattern": "Sentadilla",
    "equipmentNeeded": "Mancuerna",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH",
      "CORE"
    ],
    "technicalInstructions": "De pie con los pies colocados ligeramente más abiertos que la anchura de los hombros, sosteniendo una mancuerna entre las manos. Sujeta la mancuerna descansando a la altura del pecho con las manos sosteniendo la parte superior y con los hombros apuntando hacia abajo. El pecho hacia afuera. Respira profundamente y luego agacha los glúteos, empujando los talones hacia el suelo. Haz una pausa cuando tus muslos estén al menos paralelos al suelo, baja más si puedes. Haz una pausa, y luego vuelve a levantarte. Mantén la espalda recta en todo momento.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, colapsar rodillas o perder columna neutra.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar, rodilla o cadera.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Dumbbell-Goblet-Squat_600x600.png?v=1612049778",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/knee-tuck-jumps",
    "sourceGroup": "Piernas",
    "name": "Salto Rodillas al Pecho",
    "description": "Ejercicio para isquiotibiales, cuádriceps y abdominales",
    "primaryMuscleGroup": "isquiosurales",
    "secondaryMuscleGroups": [
      "abdomen/core"
    ],
    "movementPattern": "Patrón multiarticular de entrenamiento",
    "equipmentNeeded": "Peso corporal",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH",
      "POWER"
    ],
    "technicalInstructions": "De pie. Dobla ligeramente las rodillas para tomar impulso y luego salta llevando las rodillas hacia arriba y tan cercas del pecho como sea posible.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, colapsar rodillas o perder columna neutra.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar, rodilla o cadera.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Knee-Tuck-Jumps_dbf2e5a8-e907-4117-a044-8cd0abeb191d_600x600.png?v=1653509454",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/burpees",
    "sourceGroup": "Piernas",
    "name": "Burpees",
    "description": "Ejercicio para pectorales, tríceps, deltoides, cuádriceps, isquiotibiales, gemelos, abdominales y glúteos.",
    "primaryMuscleGroup": "isquiosurales",
    "secondaryMuscleGroups": [],
    "movementPattern": "Patrón multiarticular de entrenamiento",
    "equipmentNeeded": "Peso corporal",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH",
      "ENDURANCE"
    ],
    "technicalInstructions": "En cuclillas, con las manos en el suelo y la cabeza alineada con el cuerpo Mientras te sostienes cos las manos, mueve ambas piernas hacia atrás en posición boca arriba y realiza una flexión. Sin detenerse, vuelva a llevar las piernas a la posición inicial de cuclillas y, a continuación, realice un salto vertical levantando las manos hacia el cielo.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, colapsar rodillas o perder columna neutra.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar, rodilla o cadera.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Burpees_600x600.png?v=1640121232",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/bodyweight-squat",
    "sourceGroup": "Piernas",
    "name": "Sentadillas con propio peso",
    "description": "Ejercicio para muslos, músculos de los glúteos, gemelos, deltoides anteriores y músculos centrales (core)",
    "primaryMuscleGroup": "cuádriceps",
    "secondaryMuscleGroups": [
      "abdomen/core",
      "gemelos"
    ],
    "movementPattern": "Sentadilla",
    "equipmentNeeded": "Peso corporal",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH",
      "CORE"
    ],
    "technicalInstructions": "Párese erguido con las piernas separadas colocando los pies ligeramente más anchos que el ancho de las caderas. Extienda los brazos frente a usted. Manteniendo el pecho hacia arriba y la espalda recta, refuerce su núcleo mientras empuja sus caderas hacia atrás hasta una posición sentada. Baje hasta que sus muslos estén paralelos o casi paralelos al suelo. Haga una pausa y luego empújese hacia arriba con todo el pie hasta la posición inicial. No permita que sus rodillas se muevan hacia adentro durante el movimiento.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, colapsar rodillas o perder columna neutra.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar, rodilla o cadera.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Bodyweight-Squat_600x600.png?v=1653577860",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/1-5-rep-bodyweight-squats",
    "sourceGroup": "Piernas",
    "name": "1.5 repeticiones de sentadillas con propio peso",
    "description": "Ejercicio para muslos, músculos de los glúteos, gemelos, deltoides anteriores y músculos centrales (core)",
    "primaryMuscleGroup": "cuádriceps",
    "secondaryMuscleGroups": [
      "abdomen/core",
      "gemelos"
    ],
    "movementPattern": "Sentadilla",
    "equipmentNeeded": "Peso corporal",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH",
      "CORE"
    ],
    "technicalInstructions": "Párese erguido con los pies ligeramente separados un poco más anchos que el ancho de sus caderas. Manteniendo el pecho hacia arriba y la espalda recta, refuerce su núcleo mientras empuja sus caderas hacia atrás hasta una posición sentada. Baje hasta que sus muslos estén paralelos o casi paralelos al suelo. Haga una pausa y luego empújese hacia arriba con todo el pie hasta la mitad de la posición inicial. Haga una pausa y vuelva a bajar al paralelo. Haga una pausa más en la parte inferior antes de volver a subir a la posición inicial. No permita que sus rodillas se muevan hacia adentro durante el movimiento.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, colapsar rodillas o perder columna neutra.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar, rodilla o cadera.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Bodyweight-Squat_600x600.png?v=1653577860",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/medicine-ball-squat",
    "sourceGroup": "Piernas",
    "name": "Sentadillas con balón medicinal",
    "description": "Ejercicio para muslos, músculos de los glúteos, gemelos, deltoides anteriores y músculos centrales (core)",
    "primaryMuscleGroup": "cuádriceps",
    "secondaryMuscleGroups": [
      "abdomen/core",
      "gemelos"
    ],
    "movementPattern": "Sentadilla",
    "equipmentNeeded": "Balón medicinal",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH",
      "CORE"
    ],
    "technicalInstructions": "Párese erguido con los pies ligeramente separados un poco más anchos que el ancho de sus caderas. Manteniendo el pecho hacia arriba y la espalda recta, refuerce su núcleo mientras empuja sus caderas hacia atrás hasta una posición sentada. Baje hasta que sus muslos estén paralelos o casi paralelos al suelo. Haga una pausa y luego empújese hacia arriba con todo el pie hasta la mitad de la posición inicial. Haga una pausa y vuelva a bajar al paralelo. Haga una pausa más en la parte inferior antes de volver a subir a la posición inicial. No permita que sus rodillas se muevan hacia adentro durante el movimiento.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, colapsar rodillas o perder columna neutra.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar, rodilla o cadera.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Medicine-Ball-Squat_600x600.png?v=1655223652",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/barbell-bulgarian-split-squat",
    "sourceGroup": "Piernas",
    "name": "Sentadilla búlgara con barra",
    "description": "Ejercicio para muslos, músculos de los glúteos, gemelos y músculos centrales (core)",
    "primaryMuscleGroup": "cuádriceps",
    "secondaryMuscleGroups": [
      "abdomen/core"
    ],
    "movementPattern": "Sentadilla",
    "equipmentNeeded": "Barra",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH",
      "CORE"
    ],
    "technicalInstructions": "Coloque la barra sobre el músculo trapecio y los hombros. Descanse una pierna en el banco detrás de usted, las cuerdas de su zapato deben quedar hacia el suelo. Coloque su pie delantero aproximadamente 3 pasos delante del banco. Mantenga una postura con los pies separados al ancho de los hombros, su pie trasero no debe estar directamente detrás de su frente. Flexiona la pierna de apoyo mientras refuerza el núcleo y mantiene el pecho erguido hasta que la rodilla trasera casi toque el suelo. Haga una pausa y empuje hacia arriba solo con el pie delantero y regrese a la posición inicial. No permita que su rodilla se mueva hacia adentro o hacia afuera durante el movimiento.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, colapsar rodillas o perder columna neutra.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar, rodilla o cadera.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Barbell-Bulgarian-Split-Squat_600x600.png?v=1655223749",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/bodyweight-bulgarian-split-squat",
    "sourceGroup": "Piernas",
    "name": "Sentadilla búlgara con propio peso",
    "description": "Ejercicio para muslos, músculos de los glúteos, gemelos y músculos centrales (core)",
    "primaryMuscleGroup": "cuádriceps",
    "secondaryMuscleGroups": [
      "abdomen/core"
    ],
    "movementPattern": "Sentadilla",
    "equipmentNeeded": "Banco",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH",
      "CORE"
    ],
    "technicalInstructions": "Descanse una pierna en el banco detrás de usted, las cuerdas de su zapato deben quedar hacia el suelo. Coloque su pie delantero aproximadamente 3 pasos delante del banco. Mantenga una postura al ancho de los hombros, su pie trasero no debe estar directamente detrás de su frente. Coloque las manos en sus caderas. Flexiona la pierna de apoyo mientras refuerza el núcleo y mantiene el pecho erguido hasta que la rodilla trasera casi toque el suelo. Haga una pausa y empuje hacia arriba solo con el pie delantero y regrese a la posición inicial. No permita que su rodilla se mueva hacia adentro o hacia afuera durante el movimiento.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, colapsar rodillas o perder columna neutra.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar, rodilla o cadera.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Bodyweight-Bulgarian-Split-Squat_600x600.png?v=1655223826",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/mini-band-air-squat",
    "sourceGroup": "Piernas",
    "name": "Sentadilla con mini banda",
    "description": "Ejercicio para muslos, músculos de los glúteos, gemelos y músculos centrales (core)",
    "primaryMuscleGroup": "cuádriceps",
    "secondaryMuscleGroups": [
      "abdomen/core"
    ],
    "movementPattern": "Sentadilla",
    "equipmentNeeded": "Mini banda",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH",
      "CORE"
    ],
    "technicalInstructions": "Coloque la mini banda alrededor de ambas piernas por encima de las rodillas. Párese con los pies separados al ancho de los hombros. Manteniendo el pecho hacia arriba y la espalda recta, refuerce su núcleo mientras conduce sus caderas hacia atrás en una posición sentada. Estire la banda y manténgala apretada empujando las rodillas hacia afuera durante todo el movimiento. Baje hasta que sus muslos estén paralelos o casi paralelos al suelo. Haga una pausa y luego empújese hacia arriba con todo el pie hasta la posición inicial. No permita que sus rodillas se muevan hacia adentro durante el movimiento.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, colapsar rodillas o perder columna neutra.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar, rodilla o cadera.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Mini-Band-Air-Squat_600x600.png?v=1655223897",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/jump-squat",
    "sourceGroup": "Piernas",
    "name": "Sentadilla con salto",
    "description": "Ejercicio para muslos, músculos de los glúteos, gemelos y músculos centrales (core)",
    "primaryMuscleGroup": "cuádriceps",
    "secondaryMuscleGroups": [
      "abdomen/core"
    ],
    "movementPattern": "Sentadilla",
    "equipmentNeeded": "Peso corporal",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH",
      "POWER",
      "CORE"
    ],
    "technicalInstructions": "Párese erguido con los pies separados un poco más que el ancho de sus caderas. Manteniendo el pecho erguido, mueva las caderas hacia abajo y hacia atrás hasta justo por encima de las rodillas. Coloque hacia arriba con los brazos, balanceándolos hacia adelante, para empujare explosivamente del piso. Aterrice con las rodillas suaves y la espalda baja hasta la posición de sentadilla. Evite que las rodillas se doblen hacia adentro en cualquier momento durante el movimiento.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, colapsar rodillas o perder columna neutra.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar, rodilla o cadera.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Jump-Squat_600x600.png?v=1655223952",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/wall-sit",
    "sourceGroup": "Piernas",
    "name": "Sentadilla isométrica apoyado sobre la pared",
    "description": "Ejercicio para muslos, músculos de los glúteos, gemelos y músculos centrales (core)",
    "primaryMuscleGroup": "cuádriceps",
    "secondaryMuscleGroups": [
      "abdomen/core"
    ],
    "movementPattern": "Sentadilla",
    "equipmentNeeded": "Una pared plana",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH",
      "CORE"
    ],
    "technicalInstructions": "Párese recto con la espalda plana contra la pared con los pies separados aproximadamente al ancho de las caderas o ligeramente más separados. Flexiona las piernas, mientras mantiene la espalda plana contra la pared. Haga una pausa cuando sus muslos estén paralelos al suelo. Mantenga esta posición de forma sostenida y luego vuelva a ponerse de pie una vez completado.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, colapsar rodillas o perder columna neutra.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar, rodilla o cadera.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Wall-Sit_600x600.png?v=1655224007",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/medicine-ball-deadlift",
    "sourceGroup": "Piernas",
    "name": "Peso muerto con balón medicinal",
    "description": "Ejercicio para iquiotibiales, músculos de los glúteos y músculos centrales (core)",
    "primaryMuscleGroup": "isquiosurales",
    "secondaryMuscleGroups": [
      "abdomen/core"
    ],
    "movementPattern": "Bisagra de cadera",
    "equipmentNeeded": "Balón medicinal",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH",
      "CORE"
    ],
    "technicalInstructions": "Con el balón medicinal en el suelo frente a ti, párate erguido con los pies separados a la altura de los hombros. Mueva las caderas hacia atrás, como si alguien le estuviera tirando hacia atrás con una cuerda atada a su alrededor. Saque las rodillas, no deje que se doblen. Con los brazos extendidos, agarre la pelota con ambas manos. Manteniendo la espalda plana y el pecho hacia adelante, empuje con los talones para empujar y extender las caderas hacia adelante volviendo a la posición inicial con la pelota. Continúe este movimiento sin soltar el balón medicinal. Vuelve a colocar el balón en el suelo cuando termines las repeticiones y vuelve a la posición inicial.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, colapsar rodillas o perder columna neutra.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar, rodilla o cadera.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Medicine-Ball-Deadlift_600x600.png?v=1655224056",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/single-leg-bodyweight-deadlift",
    "sourceGroup": "Piernas",
    "name": "Peso muerto a una pierna",
    "description": "Ejercicio para iquiotibiales, músculos de los glúteos y músculos centrales (core)",
    "primaryMuscleGroup": "isquiosurales",
    "secondaryMuscleGroups": [
      "abdomen/core"
    ],
    "movementPattern": "Bisagra de cadera",
    "equipmentNeeded": "Peso corporal",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH",
      "CORE"
    ],
    "technicalInstructions": "Párese erguido con los brazos a los lados. Manteniendo una leve flexión en la rodilla con la pierna plantada, gire hacia adelante en la cadera mientras permite que el brazo opuesto a la pierna plantada se extienda hacia abajo frente a usted. Mantenga el pecho erguido mientras levanta la pierna opuesta (manteniéndola recta detrás de usted). Inclínese hacia adelante hasta 90 grados o tanto como su cuerpo lo permita. Mantenga la cabeza y el cuello alineados con la espalda durante todo el movimiento. Mueva la cadera hacia atrás hasta la posición inicial y repita con el lado opuesto. Mantenga su pierna plantada firme y no permita que se tuerza.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, colapsar rodillas o perder columna neutra.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar, rodilla o cadera.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Single-Leg-Bodyweight-Deadlift_600x600.png?v=1655224115",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/kettlebell-sumo-deadlift",
    "sourceGroup": "Piernas",
    "name": "Sentadilla sumo con kettlebell",
    "description": "Ejercicio para iquiotibiales, músculos de los glúteos y músculos centrales (core)",
    "primaryMuscleGroup": "cuádriceps",
    "secondaryMuscleGroups": [
      "abdomen/core"
    ],
    "movementPattern": "Sentadilla",
    "equipmentNeeded": "Kettlebell",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH",
      "CORE"
    ],
    "technicalInstructions": "Coloque el kettlebell en el suelo directamente entre sus pies. Tome una postura amplia moderada con los pies, apunte los dedos de los pies ligeramente hacia afuera. Empuje las caderas hacia atrás y gire hacia adelante hasta que su torso esté casi paralelo al suelo. Estírate y agarra el mango del kettlebell. Cierre las manos sobre el mango con un doble agarre por encima de la cabeza. Deje caer las caderas por debajo del nivel de los hombros y mantenga los brazos completamente extendidos desde el kettlebell. Empuje el piso lejos de usted empujando todo su pie y extendiendo sus rodillas y caderas, levantando la campana con usted. Bloquee las caderas y luego baje el cuerpo y el kettlebell hacia abajo empujando las caderas hacia atrás y girando hacia adelante en la cadera. Regrese el kettlebell al piso y luego reinicie para repetir.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, colapsar rodillas o perder columna neutra.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar, rodilla o cadera.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Kettlebell-Sumo-Deadlift_600x600.png?v=1655224172",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/good-morning",
    "sourceGroup": "Piernas",
    "name": "Ejercicio “buenos días” con barra",
    "description": "Ejercicio para iquiotibiales, músculos de los glúteos y músculos centrales (core)",
    "primaryMuscleGroup": "isquiosurales",
    "secondaryMuscleGroups": [
      "abdomen/core"
    ],
    "movementPattern": "Bisagra de cadera",
    "equipmentNeeded": "Barra",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH",
      "CORE"
    ],
    "technicalInstructions": "Párese erguido con la barra apoyada contra el músculo trapecio y los hombros con las manos colocadas justo fuera de los hombros. Coloque los pies separados a la altura de las caderas. Permita que sus rodillas se flexionen ligeramente mientras gira hacia adelante empujando sus caderas hacia atrás detrás de usted. Mantenga una posición neutral de la columna. Baje su pecho mientras refuerza su núcleo hasta que su pecho esté paralelo al piso. Extiende las caderas hacia adelante para volver a la posición inicial.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, colapsar rodillas o perder columna neutra.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar, rodilla o cadera.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Good-Morning_600x600.png?v=1655224242",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/bodyweight-glute-bridge",
    "sourceGroup": "Piernas",
    "name": "Puente con propio peso",
    "description": "Ejercicio para muslos, músculos de los glúteos y músculos centrales (core)",
    "primaryMuscleGroup": "glúteos",
    "secondaryMuscleGroups": [
      "abdomen/core"
    ],
    "movementPattern": "Extensión de cadera",
    "equipmentNeeded": "Alfombra para yoga",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "Acuéstese boca arriba sobre la colchoneta. Doble las rodillas y lleve los pies hacia usted, plantéelos planos en el suelo. Extiende los brazos a los costados con las palmas hacia abajo. Apoyándose con los talones, levante las caderas del suelo hasta que las rodillas, las caderas y los hombros formen una línea recta. Aprieta tus glúteos y mantén tu núcleo reforzado. Haga una pausa y luego baje las caderas a la posición inicial.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, colapsar rodillas o perder columna neutra.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar, rodilla o cadera.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Bodyweight-Glute-Bridge_600x600.png?v=1655224288",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/single-leg-glute-bridge",
    "sourceGroup": "Piernas",
    "name": "Puentes a una pierna",
    "description": "Ejercicio para muslos, músculos de los glúteos y músculos centrales (core)",
    "primaryMuscleGroup": "glúteos",
    "secondaryMuscleGroups": [
      "abdomen/core"
    ],
    "movementPattern": "Extensión de cadera",
    "equipmentNeeded": "Alfombra para yoga",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "Acuéstese boca arriba sobre la colchoneta. Doble las rodillas y lleve los pies hacia usted, plantéelos planos en el suelo. Extiende los brazos a los costados con las palmas hacia abajo. Levante una pierna y extiéndala recta de modo que ambos muslos queden paralelos entre sí. Conduciendo a través del talón del pie plantado, levante las caderas del suelo hasta que cree una línea recta desde los hombros hasta el pie de la pierna levantada; alinee todas las articulaciones. Aprieta tus glúteos y mantén tu núcleo reforzado. Haga una pausa y luego baje las caderas a la posición inicial mientras mantiene la pierna levantada extendida. Repite con la pierna opuesta.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, colapsar rodillas o perder columna neutra.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar, rodilla o cadera.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Single-Leg-Glute-Bridge_600x600.png?v=1655224356",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/banded-glute-bridge",
    "sourceGroup": "Piernas",
    "name": "Puente con bandas",
    "description": "Ejercicio para muslos, músculos de los glúteos y músculos centrales (core)",
    "primaryMuscleGroup": "glúteos",
    "secondaryMuscleGroups": [
      "abdomen/core"
    ],
    "movementPattern": "Extensión de cadera",
    "equipmentNeeded": "Alfombra de yoga y mini banda",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "Coloque la minibanda alrededor de ambas piernas por encima de las rodillas. Acuéstese boca arriba sobre la alfombra de yoga. Doble las rodillas y lleve los pies hacia usted, coloque los pies planos en el suelo. Extiende los brazos a los costados con las palmas hacia abajo. Conduciendo con los talones, levante las caderas del suelo hasta que las rodillas, las caderas y los hombros formen una línea recta. Apriete sus glúteos y mantenga su núcleo reforzado. Haga una pausa y luego baje las caderas a la posición inicial. Mantenga la mini banda tensa y estirada durante todo el movimiento.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, colapsar rodillas o perder columna neutra.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar, rodilla o cadera.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Banded-Glute-Bridge_600x600.png?v=1656401790",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/duck-walk",
    "sourceGroup": "Piernas",
    "name": "Caminata de pato",
    "description": "Ejercicio para muslos, músculos de los glúteos y gemelos",
    "primaryMuscleGroup": "cuádriceps",
    "secondaryMuscleGroups": [],
    "movementPattern": "Patrón multiarticular de entrenamiento",
    "equipmentNeeded": "Peso corporal",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH",
      "ENDURANCE"
    ],
    "technicalInstructions": "Párese con los pies separados al ancho de los hombros. Póngase en cuclillas hasta quedar sentado empujando las caderas hacia atrás. Realice en una sentadilla profunda sin levantar los pies del suelo. Mantenga su pecho alto y refuerce su núcleo. Puede mantener los brazos en el aire para ayudar con el equilibrio. Mientras mantiene la misma distancia del piso, dé un pequeño paso hacia adelante con un pie. Repite con el otro pie. También puedes dar pasos hacia atrás.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, colapsar rodillas o perder columna neutra.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar, rodilla o cadera.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Duck-Walk_600x600.png?v=1656401872",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/bird-dog",
    "sourceGroup": "Piernas",
    "name": "Ejercicio Superman en cuadrupedia",
    "description": "Ejercicio para músculos centrales (core) y gemelos",
    "primaryMuscleGroup": "abdomen/core",
    "secondaryMuscleGroups": [],
    "movementPattern": "Flexión o estabilización de tronco",
    "equipmentNeeded": "Alfombra de yoga",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH",
      "CORE",
      "ENDURANCE"
    ],
    "technicalInstructions": "Colóquese sobre una alfombra de yoga. Colóquese sobre sus manos y rodillas. Coloque sus manos directamente al ancho de sus hombros y sus rodillas justo debajo de sus caderas. Mientras mantiene una columna neutral y refuerza su núcleo, extienda un brazo recto frente a usted y extienda la pierna opuesta hacia atrás hasta que esté paralela al suelo y haya creado una línea recta con su cuerpo. Mantenga sus caderas paralelas al suelo. Mantenga esta posición brevemente y luego vuelva a bajar a la posición inicial. Repita con el lado opuesto.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, tirar del cuello o arquear la zona lumbar.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar, embarazo o diástasis sin indicación profesional.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Bird-Dog_600x600.png?v=1656401941",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/groiners",
    "sourceGroup": "Piernas",
    "name": "Los Groiners",
    "description": "Ejercicio para muslos, cadera y músculos centrales (core)",
    "primaryMuscleGroup": "abdomen/core",
    "secondaryMuscleGroups": [],
    "movementPattern": "Flexión o estabilización de tronco",
    "equipmentNeeded": "Alfombra para yoga",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH",
      "CORE",
      "ENDURANCE"
    ],
    "technicalInstructions": "Colóquese en posición de lagartija con las manos directamente debajo de los hombros. Manteniendo la espalda plana, de un paso con un pie al lado de su mano o tan cerca como pueda. Puede permitir que la rodilla opuesta se doble ligeramente mientras se inclina hacia el estiramiento. Mantenga el estiramiento durante el tiempo deseado y luego repita con la pierna opuesta.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, tirar del cuello o arquear la zona lumbar.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar, embarazo o diástasis sin indicación profesional.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Groiners_600x600.png?v=1656402166",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/fire-hydrants",
    "sourceGroup": "Piernas",
    "name": "Hidrantes",
    "description": "Ejercicio para músculos de los glúteos y músculos centrales (core)",
    "primaryMuscleGroup": "glúteos",
    "secondaryMuscleGroups": [
      "abdomen/core"
    ],
    "movementPattern": "Patrón multiarticular de entrenamiento",
    "equipmentNeeded": "Alfombra para yoga",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "Utilizando una alfombra de yoga, colóquese sobre sus manos y rodillas. Coloque sus manos directamente debajo de sus hombros y sus rodillas justo debajo de sus caderas. Manteniendo la espalda plana y el núcleo enganchado, levante una pierna hacia un lado manteniendo la rodilla doblada. Haga una pausa y vuelva a la posición inicial. Repita con la pierna opuesta.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, colapsar rodillas o perder columna neutra.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar, rodilla o cadera.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Fire-Hydrant_600x600.png?v=1656402231",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/smith-machine-hip-thrust",
    "sourceGroup": "Piernas",
    "name": "Elevaciones de cadera con maquina Smith",
    "description": "Ejercicio para muslos, músculos de los glúteos y músculos centrales (core)",
    "primaryMuscleGroup": "glúteos",
    "secondaryMuscleGroups": [
      "abdomen/core"
    ],
    "movementPattern": "Patrón multiarticular de entrenamiento",
    "equipmentNeeded": "Máquina Smith, banco, almohadilla para sentadillas o toalla si es necesario para el acolchado",
    "equipmentType": "maquina",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "Coloque el banco en la entrada de la máquina Smith, paralelo a la barra. Coloque la toalla doblada sobre sus caderas mientras se acuesta justo debajo de la barra y coloque la parte superior de la espalda contra el banco. Coloque los pies frente a usted aproximadamente al ancho de los hombros. Apunte sus pies ligeramente hacia afuera. Asegúrese de que la barra esté colocada en el pliegue de su cadera. Coloque sus manos en la barra a sus lados. Extienda sus caderas para destrabar la barra. Mantenga su núcleo apretado y meta su barbilla. Permita que sus caderas bajen hacia el piso para bajar la barra. No realice un movimiento profundo hasta el suelo, invierta el movimiento empujando las caderas y la barra hacia arriba hasta que vuelva a estar paralelo al suelo. Apriete los glúteos en la parte superior mientras mantienes la espalda recta. Pausa y repite.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, colapsar rodillas o perder columna neutra.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar, rodilla o cadera.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Smith-Machine-Hip-Thrust_600x600.png?v=1656402282",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/barbell-hip-thrust",
    "sourceGroup": "Piernas",
    "name": "Elevaciones de cadera con barra",
    "description": "Ejercicio para muslos, músculos de los glúteos y músculos centrales (core)",
    "primaryMuscleGroup": "glúteos",
    "secondaryMuscleGroups": [
      "abdomen/core"
    ],
    "movementPattern": "Patrón multiarticular de entrenamiento",
    "equipmentNeeded": "Barra y banco, almohadilla tubular para sentadillas o toalla si es necesario para el acolchado",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "Con la barra cerca y paralela al banco, siéntese en el suelo con la parte superior de la espalda contra el banco. Ruede la barra sobre sus piernas para que ahora descanse sobre el pliegue de la cadera. Acerque los pies y colóquelos planos en el suelo a una distancia paralela al ancho de los hombros. Apoyándose a través de todo el pie, levante las caderas ligeramente por encima del suelo mientras agarra la barra por los lados. Mantenga la barbilla doblada durante todo el movimiento. Apriete los glúteos para empujar las caderas y la barra hacia arriba hasta que estés paralelo al suelo en una posición de mesa. Haga una pausa y baje las caderas hacia el piso, manteniendo el movimiento controlado. No realice un movimiento profundo hasta el suelo. Mantenga su pecho alineado con sus caderas. Sostenga el movimiento por encima del suelo y repita.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, colapsar rodillas o perder columna neutra.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar, rodilla o cadera.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Barbell-Hip-Thrust_600x600.png?v=1656402338",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/band-seated-hip-abduction",
    "sourceGroup": "Piernas",
    "name": "Abducciones de cadera sentado con banda",
    "description": "Ejercicio para músculos de los glúteos",
    "primaryMuscleGroup": "glúteos",
    "secondaryMuscleGroups": [],
    "movementPattern": "Patrón multiarticular de entrenamiento",
    "equipmentNeeded": "Minibanda y banco",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "Coloque la mini banda alrededor de las piernas por encima de las rodillas. Siéntese en el borde del banco con los pies separados al ancho de los hombros y la espalda recta. Coloque sus manos en el banco a los lados. Usando sus glúteos, empuje sus rodillas hacia afuera estirando la banda. Haga una pausa y vuelva a la posición inicial.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, colapsar rodillas o perder columna neutra.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar, rodilla o cadera.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Band-Seated-Hip-Abduction_600x600.png?v=1656404992",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/seated-hip-abduction-machine",
    "sourceGroup": "Piernas",
    "name": "Abducción de cadera con máquina de abducción de cadera",
    "description": "Ejercicio para abductores de cadera y músculos de los glúteos",
    "primaryMuscleGroup": "glúteos",
    "secondaryMuscleGroups": [],
    "movementPattern": "Patrón multiarticular de entrenamiento",
    "equipmentNeeded": "Máquina de abducción de cadera",
    "equipmentType": "maquina",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "Siéntese en la máquina con las rodillas hacia adentro y contra las almohadillas. Tire del pasador para liberar las almohadillas. Agarre las asas de los lados. Empuje contra las almohadillas con las rodillas. Cuando sus caderas estén completamente abducidas, haga una pausa y luego regrese a la posición inicial.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, colapsar rodillas o perder columna neutra.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar, rodilla o cadera.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Seated-Hip-Abduction-Machine_600x600.png?v=1656405168",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/standing-cable-abduction",
    "sourceGroup": "Piernas",
    "name": "Abducción con polea",
    "description": "Ejercicio para músculos de los glúteos y músculos centrales (core)",
    "primaryMuscleGroup": "glúteos",
    "secondaryMuscleGroups": [
      "abdomen/core"
    ],
    "movementPattern": "Patrón multiarticular de entrenamiento",
    "equipmentNeeded": "Máquina de cable con accesorios para el tobillo",
    "equipmentType": "polea",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "Párese erguido con un hombro al lado de la máquina. Coloque el accesorio de tobillo en el tobillo más alejado de la máquina. Coloque la mano más cercana en la máquina de cable y la otra en su cadera. Manteniendo la pierna estirada, levante la pierna hacia el costado lo más alto que pueda. Haga una pausa y vuelva a la posición inicial.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, colapsar rodillas o perder columna neutra.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar, rodilla o cadera.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Standing-Cable-Abduction_600x600.png?v=1656405251",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/bodyweight-frog-pump",
    "sourceGroup": "Piernas",
    "name": "Elevaciones en posición de rana con propio peso",
    "description": "Ejercicio para muslos, músculos de los glúteos y músculos centrales (core)",
    "primaryMuscleGroup": "glúteos",
    "secondaryMuscleGroups": [
      "abdomen/core"
    ],
    "movementPattern": "Patrón multiarticular de entrenamiento",
    "equipmentNeeded": "Alfombra para yoga",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "Acuéstese boca arriba. Acerque los pies a los glúteos y junte las plantas para crear una posición de mariposa con las piernas. Apoye los brazos en el suelo a los lados. Manteniendo la barbilla doblada y los hombros en el suelo, presione hacia abajo en el piso con los bordes de los pies mientras aprieta los glúteos para empujar las caderas hacia arriba. Cuando sus hombros, caderas y rodillas estén alineados, haga una pausa en la parte superior y luego baje las caderas de regreso a la posición inicial.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, colapsar rodillas o perder columna neutra.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar, rodilla o cadera.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Bodyweight-Frog-Pump_600x600.png?v=1656405316",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/smith-machine-frog-pump",
    "sourceGroup": "Piernas",
    "name": "Elevaciones cortas en posición de rana con maquina Smith",
    "description": "Ejercicio para muslos, músculos de los glúteos y músculos centrales (core)",
    "primaryMuscleGroup": "glúteos",
    "secondaryMuscleGroups": [
      "abdomen/core"
    ],
    "movementPattern": "Patrón multiarticular de entrenamiento",
    "equipmentNeeded": "Máquina y banco Smith, almohadilla tubular para sentadillas o toalla si es necesario para el acolchado",
    "equipmentType": "maquina",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "Coloque el banco dentro de la máquina Smith, perpendicular a la barra. Coloque la esponja en cuclillas en el centro de la barra o coloque la toalla doblada sobre sus caderas mientras se acuesta en el banco y se posiciona debajo de la barra. Coloque la barra sobre el pliegue de su cadera. Acerque los pies a los glúteos en el banco y junta las plantas para crear una posición de mariposa con las piernas. Manteniendo la barbilla doblada y los hombros contra el banco, presione hacia abajo en el banco con los bordes de los pies mientras aprieta los glúteos para empujar las caderas y empujar la barra hacia arriba. Mantenga su núcleo reforzado. Cuando sus hombros, caderas y rodillas estén alineados, haga una pausa en la parte superior y luego baje las caderas de regreso a la posición inicial.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, colapsar rodillas o perder columna neutra.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar, rodilla o cadera.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Smith-Machine-Frog-Pump_600x600.png?v=1656405486",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/banded-clams",
    "sourceGroup": "Piernas",
    "name": "Almejas laterales con banda",
    "description": "Ejercicio para músculos de los glúteos y músculos centrales (core)",
    "primaryMuscleGroup": "glúteos",
    "secondaryMuscleGroups": [
      "abdomen/core"
    ],
    "movementPattern": "Patrón multiarticular de entrenamiento",
    "equipmentNeeded": "Alfombra para yoga y minibanda",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "Coloque la minibanda alrededor de las piernas, justo por encima de las rodillas. Acuéstese de lado. Manteniendo los pies alineados con las caderas, doble las rodillas para formar un ángulo de 90 grados. Descanse su cabeza en su brazo. Manteniendo el núcleo enganchado y los pies juntos, levante la rodilla superior lo más alto que pueda sin levantar la rodilla inferior del suelo o torcer las caderas. Haga una pausa y vuelva a la posición inicial de forma controlada. Termine sus repeticiones y repita en el lado opuesto.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, colapsar rodillas o perder columna neutra.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar, rodilla o cadera.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Banded-Clams_600x600.png?v=1656405564",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/side-lying-leg-raise",
    "sourceGroup": "Piernas",
    "name": "Levantamiento de pierna acostado de lado",
    "description": "Ejercicio para músculos de los glúteos y músculos centrales (core)",
    "primaryMuscleGroup": "glúteos",
    "secondaryMuscleGroups": [
      "abdomen/core"
    ],
    "movementPattern": "Patrón multiarticular de entrenamiento",
    "equipmentNeeded": "Alfombra de yoga",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "Acuéstese sobre una alfombra de yoga de forma lateral. Use el brazo en el piso para amortiguar su cabeza. Doble la pierna en el suelo para ayudar a mantener el equilibrio. Coloque su mano superior en el suelo frente a usted. Manteniendo la pierna superior recta y todas las articulaciones en línea recta, levante la pierna hacia el techo. Haga una pausa en la parte superior y bájala hasta la posición inicial. Termine sus repeticiones y repite con el lado opuesto.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, colapsar rodillas o perder columna neutra.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar, rodilla o cadera.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Side-Lying-Leg-Raise_600x600.png?v=1656405688",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/glute-ham-raise",
    "sourceGroup": "Piernas",
    "name": "Elevaciones de bíceps femoral con máquina GHD",
    "description": "Ejercicio para muslos, músculos de los glúteos y músculos centrales (core)",
    "primaryMuscleGroup": "isquiosurales",
    "secondaryMuscleGroups": [
      "abdomen/core"
    ],
    "movementPattern": "Patrón multiarticular de entrenamiento",
    "equipmentNeeded": "Máquina GHD",
    "equipmentType": "maquina",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "Párese sobre el centro de la máquina y coloque los pies en las almohadillas de los tobillos con los dedos de los pies contra la placa mientras usa las manos para sujetar las almohadillas delanteras. Deje que sus rodillas caigan un poco por debajo de las almohadillas. Con la parte delantera de las rodillas presionada contra las almohadillas, lleve el cuerpo perpendicular al suelo. Manteniendo la espalda y las caderas rectas y alineadas, doble las rodillas para bajar contra las almohadillas, manteniendo los brazos contra el pecho. Baje hasta que esté paralelo al suelo y luego vuelve a la posición inicial.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, colapsar rodillas o perder columna neutra.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar, rodilla o cadera.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Glute-Ham-Raise_600x600.png?v=1656405832",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/dumbbell-step-up",
    "sourceGroup": "Piernas",
    "name": "Step Up con mancuernas",
    "description": "Ejercicio para muslos, músculos de los glúteos, gemelos y músculos centrales (core)",
    "primaryMuscleGroup": "cuádriceps",
    "secondaryMuscleGroups": [
      "abdomen/core"
    ],
    "movementPattern": "Patrón multiarticular de entrenamiento",
    "equipmentNeeded": "Step y mancuernas",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH",
      "ENDURANCE"
    ],
    "technicalInstructions": "Párese erguido frente al escalón con mancuernas en cada mano a los lados. Manteniendo el pecho alto y el núcleo firme, suba un pie al escalón y coloque todo el pie plano sobre el escalón. Pon el otro pie en el escalón. Da un paso atrás y abajo del escalón con el segundo pie que subiste, luego baja con el primer pie. Repite con el lado opuesto. No permita que su rodilla se mueva hacia adentro o hacia afuera durante el movimiento.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, colapsar rodillas o perder columna neutra.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar, rodilla o cadera.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Dumbbell-Step-Up_600x600.png?v=1656405942",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/lateral-mini-band-walk",
    "sourceGroup": "Piernas",
    "name": "Caminata lateral con minibanda",
    "description": "Ejercicio para muslos, músculos de los glúteos, gemelos y músculos centrales (core)",
    "primaryMuscleGroup": "glúteos",
    "secondaryMuscleGroups": [
      "abdomen/core"
    ],
    "movementPattern": "Patrón multiarticular de entrenamiento",
    "equipmentNeeded": "Minibanda",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH",
      "ENDURANCE"
    ],
    "technicalInstructions": "Coloque la minibanda alrededor de las piernas, justo por encima de las rodillas. Coloque los pies separados al ancho de los hombros y asegúrese de que no haya holgura en la banda. Doble ligeramente las rodillas, colocándose en una postura atlética en una posición de media sentadilla. Distribuya su peso en ambos pies. Manteniendo la posición de media sentadilla, dar un paso lateral con un pie. Siga con el otro pie. Realice la cantidad deseada de pasos hacia un lado y luego repita con el lado opuesto o alterne entre cada lado hasta completar todas las repeticiones.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, colapsar rodillas o perder columna neutra.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar, rodilla o cadera.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Mini-Band-Lateral-Walks_600x600.png?v=1656406023",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/standing-knee-raise",
    "sourceGroup": "Piernas",
    "name": "Elevaciones de rodilla",
    "description": "Ejercicio para muslos, músculos de los glúteos y músculos centrales (core)",
    "primaryMuscleGroup": "glúteos",
    "secondaryMuscleGroups": [
      "abdomen/core"
    ],
    "movementPattern": "Patrón multiarticular de entrenamiento",
    "equipmentNeeded": "Peso corporal",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "Párese erguido con los pies separados al ancho de los hombros. Coloque sus manos sobre sus caderas. Con un pie firmemente plantado en el suelo, levante una rodilla frente a usted hasta que su muslo esté paralelo al suelo sin permitir que sus caderas se tuerzan. Haz una pausa y vuelve a la posición inicial. Repita con la pierna opuesta mientras permanece en el mismo lugar durante todas las repeticiones.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, colapsar rodillas o perder columna neutra.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar, rodilla o cadera.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Standing-Knee-Raise_600x600.png?v=1656406133",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/kettlebell-swings",
    "sourceGroup": "Piernas",
    "name": "Columpios con kettlebell",
    "description": "Ejercicio para muslos, músculos de los glúteos y músculos centrales (core)",
    "primaryMuscleGroup": "glúteos",
    "secondaryMuscleGroups": [
      "abdomen/core"
    ],
    "movementPattern": "Patrón multiarticular de entrenamiento",
    "equipmentNeeded": "Kettlebell",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "Agarre el kettlebell con un doble agarre por encima de la cabeza. Póngase de pie con los brazos extendidos y sueltos. Involucre su núcleo. Flexione las rodillas para bajar los glúteos hacia atrás y hacia abajo, mientras cambia su peso hacia los talones. Conduce a través de tus talones para impulsar explosivamente tus caderas hacia adelante con el fin de balancear la pesa hacia arriba. Balancee el kettlebell hasta aproximadamente la altura del pecho con los brazos extendidos. Deje que la pesa vuelva a caer para prepararse para el próximo swing. Apoye su cuerpo para agarrar el peso en la posición inferior, lo que le permite balancearse a través de sus piernas y luego repita el movimiento de balanceo hacia adelante.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, colapsar rodillas o perder columna neutra.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar, rodilla o cadera.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Kettlebell-Swing_600x600.png?v=1656782014",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/standing-cable-kickback",
    "sourceGroup": "Piernas",
    "name": "Contragolpe con cable",
    "description": "Ejercicio para muslos, músculos de los glúteos, gemelos y músculos centrales (core)",
    "primaryMuscleGroup": "glúteos",
    "secondaryMuscleGroups": [
      "abdomen/core"
    ],
    "movementPattern": "Patrón multiarticular de entrenamiento",
    "equipmentNeeded": "Máquina de cable y accesorios de tobillo",
    "equipmentType": "polea",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "Coloque la minibanda alrededor de las piernas, justo por encima de las rodillas. Coloque los pies separados al ancho de los hombros y asegúrese de que no haya holgura en la banda. Doble ligeramente las rodillas, colocándose en una postura atlética en una posición de media sentadilla. Distribuya su peso en ambos pies. Manteniendo la posición de media sentadilla, dar un paso lateral con un pie. Siga con el otro pie. Realice la cantidad deseada de pasos hacia un lado y luego repita con el lado opuesto o alterne entre cada lado hasta completar todas las repeticiones.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, colapsar rodillas o perder columna neutra.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar, rodilla o cadera.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Standing-Cable-Kickback_600x600.png?v=1656782126",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/donkey-kicks",
    "sourceGroup": "Piernas",
    "name": "Patadas de burro",
    "description": "Ejercicio para músculos de los glúteos y músculos centrales (core)",
    "primaryMuscleGroup": "glúteos",
    "secondaryMuscleGroups": [
      "abdomen/core"
    ],
    "movementPattern": "Extensión de cadera",
    "equipmentNeeded": "Alfombra para yoga",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "Póngase en la alfombra para yoga. Colóquese sobre sus manos y rodillas. Coloque sus manos directamente debajo de sus hombros y sus rodillas justo debajo de sus caderas. Coloque su cabeza para mirar al suelo. Involucre su núcleo y mantenga su espalda plana en una posición de mesa. Manteniendo la flexión de 90 grados en la rodilla, levante la pierna hacia atrás y hacia arriba para que su pie vaya hacia el techo. Trate de poner su muslo en paralelo con el piso sin torcer las caderas o redondear la espalda, deténgase antes si esto ocurre. Regrese la pierna a la posición inicial.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, colapsar rodillas o perder columna neutra.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar, rodilla o cadera.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Donkey-Kicks_600x600.png?v=1656782198",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/side-lying-hip-raise",
    "sourceGroup": "Piernas",
    "name": "Elevaciones de cadera acostado lateralmente",
    "description": "Ejercicio para músculos de los glúteos y músculos centrales (core)",
    "primaryMuscleGroup": "glúteos",
    "secondaryMuscleGroups": [],
    "movementPattern": "Patrón multiarticular de entrenamiento",
    "equipmentNeeded": "Alfombra para yoga",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH"
    ],
    "technicalInstructions": "Acuéstese de costado con las piernas una encima de la otra. Apóyese colocando el codo y el antebrazo apoyados en el suelo, con el brazo apuntando en dirección opuesta a usted. Apile el codo debajo del hombro. Doble las rodillas en un ángulo de 90 grados para que sus pies estén detrás de usted, manteniéndolos apilados. Manteniendo los pies juntos y el núcleo enganchado, levante las caderas hacia arriba desde el suelo. Mantenga su cuerpo en línea durante todo el movimiento. En el mismo movimiento, contraiga los glúteos para levantar la rodilla superior hacia el techo, manteniendo la rodilla inferior en el suelo. Haga una pausa y vuelva a bajar a la posición inicial.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, colapsar rodillas o perder columna neutra.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar, rodilla o cadera.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Side-Lying-Hip-Raise_600x600.png?v=1656782257",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/squat-sit-to-reach",
    "sourceGroup": "Piernas",
    "name": "Sentadilla Posturas funcionales",
    "description": "Ejercicio para muslos, músculos de los glúteos, gemelos y músculos centrales (core)",
    "primaryMuscleGroup": "cuádriceps",
    "secondaryMuscleGroups": [
      "abdomen/core"
    ],
    "movementPattern": "Sentadilla",
    "equipmentNeeded": "Peso corporal",
    "equipmentType": "libre",
    "goals": [
      "STRENGTH",
      "CORE"
    ],
    "technicalInstructions": "Párese recto con los pies separados al ancho de los hombros. Bájese como en una sentadilla al mover las caderas hacia atrás. Bájese hasta el fondo hasta una posición profunda y sentada en cuclillas. Mientras está sentado en la posición inferior, tome un brazo y coloque el codo en la misma rodilla lateral. Coloque esa mano en el suelo fuera del pie. Con el brazo opuesto, estire hacia arriba y hacia atrás hacia el cielo girando la parte superior de su cuerpo. Vuelva a bajar el brazo y repita con el lado opuesto. Cuando termine, empuje hacia arriba con los pies para volver a la posición de pie. No permita que su rodilla se mueva hacia adentro.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil, colapsar rodillas o perder columna neutra.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Precaución en dolor lumbar, rodilla o cadera.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Squat-Sit-to-Reach_600x600.png?v=1656783666",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/seated-calf-raise",
    "sourceGroup": "Gemelos",
    "name": "Elevación de gemelos sentado",
    "description": "Ejercicio para gemelos",
    "primaryMuscleGroup": "gemelos",
    "secondaryMuscleGroups": [],
    "movementPattern": "Flexión plantar",
    "equipmentNeeded": "Máquina de elevación de gemelos sentado",
    "equipmentType": "maquina",
    "goals": [
      "STRENGTH",
      "ENDURANCE"
    ],
    "technicalInstructions": "Sentado en la máquina con la parte delantera de los pies en la cuña y la parte inferior de los muslos bajo las partes acolchadas. A la vez que contraes los gemelos, levanta los talones lo más alto posible. Permanece en la posición más elevada por un momento, sintiendo bien la contracción. Luego baja lentamente los talones estirando las pantorrillas.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Ajustar la máquina para evitar trayectorias articulares forzadas.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Seated-Calf-Raise_8c8641b2-10f2-4dc8-9adb-8d80fd1a16d0_600x600.png?v=1612137064",
    "videoUrl": null
  },
  {
    "sourceUrl": "https://www.simplyfitness.com/es/pages/standing-calf-raise",
    "sourceGroup": "Gemelos",
    "name": "Elevación de gemelos de pie",
    "description": "Ejercicio para gemelos",
    "primaryMuscleGroup": "gemelos",
    "secondaryMuscleGroups": [],
    "movementPattern": "Flexión plantar",
    "equipmentNeeded": "Máquina de elevación de gemelos de pie",
    "equipmentType": "maquina",
    "goals": [
      "STRENGTH",
      "ENDURANCE"
    ],
    "technicalInstructions": "De pie con la parte delantera de los pies en la cuña y los hombros bajo las partes acolchadas del aparato. A la vez que contraes los gemelos, levanta los talones lo más alto posible. Mantente en la posición más elevada por un momento, sintiendo bien la contracción. Luego baja lentamente los talones estirando las pantorrillas.",
    "commonMistakes": "usar impulso excesivo, perder alineación articular, acortar el rango útil.",
    "contraindications": "Evitar si provoca dolor agudo, pérdida de control técnico o compensaciones marcadas; ajustar carga, rango o variante según antecedentes. Ajustar la máquina para evitar trayectorias articulares forzadas.",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Standing-Calf-Raise_61746b47-98aa-49ee-bb97-5a19562592b9_600x600.png?v=1612137090",
    "videoUrl": null
  }
] satisfies Array<
  Omit<
    Prisma.ExerciseUncheckedCreateInput,
    | 'createdByUserId'
    | 'reviewedByUserId'
    | 'reviewedAt'
    | 'createdAt'
    | 'updatedAt'
    | 'approvalStatus'
    | 'operationalStatus'
  > & { sourceUrl: string; sourceGroup: string }
>;

function assertAllowedEnvironment() {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isLocalDatabase =
    connectionString?.includes('localhost') ||
    connectionString?.includes('127.0.0.1');
  const allowProductionSeed =
    process.env.ALLOW_PRODUCTION_EXERCISE_SEED === 'true';

  if ((!isDevelopment || !isLocalDatabase) && !allowProductionSeed) {
    throw new Error(
      [
        'Refusing to seed exercises outside local/dev without ALLOW_PRODUCTION_EXERCISE_SEED=true.',
        `NODE_ENV=${process.env.NODE_ENV ?? '(empty)'}`,
        `DATABASE_URL=${connectionString ?? '(empty)'}`,
      ].join(' '),
    );
  }
}

function assertNoDuplicateNames(records: typeof simplyFitnessExercises) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const record of records) {
    if (seen.has(record.name)) duplicates.add(record.name);
    seen.add(record.name);
  }

  if (duplicates.size > 0) {
    throw new Error(`Duplicate exercise names: ${Array.from(duplicates).join(', ')}`);
  }
}

async function main() {
  assertAllowedEnvironment();
  assertNoDuplicateNames(simplyFitnessExercises);

  const admin = await prisma.user.findFirst({
    where: { role: UserRole.ADMIN },
    orderBy: { createdAt: 'asc' },
  });

  if (!admin) {
    throw new Error('Create a first admin before seeding exercises.');
  }

  const now = new Date();
  let created = 0;
  let updated = 0;

  for (const { sourceUrl, sourceGroup, ...exercise } of simplyFitnessExercises) {
    const data = {
      ...exercise,
      approvalStatus: ExerciseApprovalStatus.APPROVED,
      operationalStatus: ExerciseOperationalStatus.ACTIVE,
      createdByUserId: admin.id,
      reviewedByUserId: admin.id,
      reviewedAt: now,
      createdAt: now,
      updatedAt: now,
    };

    const existing = await prisma.exercise.findFirst({
      where: { name: exercise.name },
      select: { id: true },
    });

    if (existing) {
      await prisma.exercise.update({
        where: { id: existing.id },
        data: {
          ...data,
          createdAt: undefined,
          createdByUserId: undefined,
        },
      });
      updated += 1;
    } else {
      await prisma.exercise.create({ data });
      created += 1;
    }
  }

  console.log(
    JSON.stringify(
      {
        total: simplyFitnessExercises.length,
        created,
        updated,
        byGoal: countByExpanded(simplyFitnessExercises, (exercise) => exercise.goals),
        byPrimaryMuscleGroup: countBy(simplyFitnessExercises, (exercise) => exercise.primaryMuscleGroup),
        byEquipmentType: countBy(simplyFitnessExercises, (exercise) => String(exercise.equipmentType)),
        source: 'https://www.simplyfitness.com/es/pages/workout-exercise-guides',
      },
      null,
      2,
    ),
  );
}

function countBy<T>(records: T[], getKey: (record: T) => string) {
  return records.reduce<Record<string, number>>((accumulator, record) => {
    const key = getKey(record);
    accumulator[key] = (accumulator[key] ?? 0) + 1;
    return accumulator;
  }, {});
}

function countByExpanded<T>(records: T[], getKeys: (record: T) => readonly string[]) {
  return records.reduce<Record<string, number>>((accumulator, record) => {
    for (const key of getKeys(record)) {
      accumulator[key] = (accumulator[key] ?? 0) + 1;
    }

    return accumulator;
  }, {});
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
