import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const stringsData = [
  {
    "brand": "Gamma",
    "model": "Moto",
    "gauge": "1.29mm (16G)",
    "type": "Co-Polyester (Heptagonal)",
    "base_life_hours": 12,
    "description_de": "Die Gamma Moto ist eine Hochleistungssaite mit einem einzigartigen siebeneckigen Profil. **Vorteile:** Durch die scharfen Kanten beißt sich die Saite förmlich in den Ball, was dir massiven Topspin und präzise Kontrolle bei harten Schlägen verleiht. Sie ist extrem langlebig und behält ihre Struktur auch bei intensivem Spiel. **Zu beachten:** Als steifere Polyester-Saite bietet sie etwas weniger Eigenpower und verlangt nach einer sauberen Technik, um den Arm zu schonen.",
    "benefits": ["Extremer Spin", "Maximale Kontrolle", "Hohe Haltbarkeit"]
  },
  {
    "brand": "Gamma",
    "model": "Moto",
    "gauge": "1.24mm (17G)",
    "type": "Co-Polyester (Heptagonal)",
    "base_life_hours": 10,
    "description_de": "Die dünnere Version der Moto für noch mehr Gefühl. **Vorteile:** Das 1.24mm Maß erhöht die Elastizität und sorgt für einen noch besseren 'Snapback'-Effekt, was deine Spin-Raten maximiert. Das Feedback beim Treffpunkt ist direkter und lebendiger als bei der dickeren Variante. **Zu beachten:** Durch den geringeren Durchmesser ist die Saite etwas anfälliger für Verschleiß und verliert die optimale Spannung ein klein wenig schneller.",
    "benefits": ["Hervorragender Snapback", "Mehr Ballgefühl", "Aggressiver Spin"]
  },
  {
    "brand": "Dunlop",
    "model": "NT Max Plus",
    "gauge": "1.30mm",
    "type": "Co-Polyester",
    "base_life_hours": 15,
    "description_de": "Die Dunlop NT zeichnet sich durch eine spezielle Oberflächenbeschichtung aus, die Reibung minimiert. **Vorteile:** Diese Saite bietet eine für Polyester-Saiten überragende Spannungsstabilität und ein sehr konstantes Spielgefühl über die gesamte Lebensdauer. Sie fühlt sich im Treffpunkt solide und 'knackig' an. **Zu beachten:** Sie bietet etwas weniger extremen Spin als strukturierte Saiten, ist dafür aber ein zuverlässiger Partner für druckvolles Grundlinienspiel.",
    "benefits": ["Konstante Spannung", "Hohe Präzision", "Lange Haltbarkeit"]
  },
  {
    "brand": "Dunlop",
    "model": "NT Max Plus",
    "gauge": "1.25mm",
    "type": "Co-Polyester",
    "base_life_hours": 13,
    "description_de": "Die 1.25mm Variante der Dunlop NT bietet die perfekte Balance aus Speed und Kontrolle. **Vorteile:** Dank der glatten Oberfläche gleiten die Saiten effizient aneinander vorbei, was für gute Power und eine angenehme Armschonung sorgt. Ideal für Spieler, die Präzision suchen, ohne auf Komfort zu verzichten. **Zu beachten:** Bei sehr harten Schlägernutzern kann die Saite nach einiger Zeit leicht verrutschen, sobald die Beschichtung nachlässt.",
    "benefits": ["Optimale Balance", "Guter Komfort", "Direktes Feedback"]
  }
]

async function main() {
  console.log('Start seeding...')

  for (const s of stringsData) {
    const benefitsString = JSON.stringify(s.benefits)
    await prisma.tennisString.create({
      data: {
        brand: s.brand,
        model: s.model,
        gauge: s.gauge,
        type: s.type,
        baseLifeHours: s.base_life_hours,
        descriptionDe: s.description_de,
        benefits: benefitsString,
      }
    })
  }
  
  // No default test players in production
  
  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
