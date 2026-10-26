/* Same content as data/db.json — used when the app is opened straight from disk (file://), where the browser blocks reading db.json. Keep both in sync. */
window.DB_FILE={
  "meta": {
    "app": "FoxBillions",
    "schema": 3,
    "updated": null,
    "note": "Mock data file. Passwords are plain text for the demo only.",
    "edition": "2026-10-21-demo2"
  },
  "settings": {
    "sla": {
      "open": [3, 6],
      "waiting": [5, 10]
    },
    "workAlert": {
      "amber": 14,
      "red": 5
    },
    "dimensions": [
      {
        "code": "ESPECIALIDADE",
        "name": "Especialidade",
        "values": [
          {
            "code": "ALVENARIA",
            "name": "Alvenaria (pedreiro)"
          },
          {
            "code": "PINTURA",
            "name": "Pintura"
          },
          {
            "code": "CANALIZACAO",
            "name": "Canalização"
          },
          {
            "code": "ELETRICIDADE",
            "name": "Eletricidade"
          },
          {
            "code": "LADRILHOS",
            "name": "Ladrilhos e azulejos"
          },
          {
            "code": "CARPINTARIA",
            "name": "Carpintaria"
          },
          {
            "code": "PLADUR",
            "name": "Pladur e tetos falsos"
          },
          {
            "code": "TELHADOS",
            "name": "Telhados"
          },
          {
            "code": "IMPERMEABILIZACAO",
            "name": "Impermeabilização"
          },
          {
            "code": "AVAC",
            "name": "AVAC (climatização)"
          },
          {
            "code": "SERRALHARIA",
            "name": "Serralharia"
          },
          {
            "code": "MANUTENCAO",
            "name": "Manutenção geral"
          }
        ]
      },
      {
        "code": "VIATURA",
        "name": "Viatura",
        "values": [
          {
            "code": "SIM",
            "name": "Tem viatura"
          },
          {
            "code": "NAO",
            "name": "Sem viatura"
          }
        ]
      }
    ],
    "quoteTypes": [
      {
        "code": "WC",
        "name": "Remodelação de casa de banho",
        "dims": {
          "ESPECIALIDADE": ["CANALIZACAO", "LADRILHOS", "ELETRICIDADE"]
        }
      },
      {
        "code": "PINTURA",
        "name": "Pintura interior",
        "dims": {
          "ESPECIALIDADE": ["PINTURA"]
        }
      },
      {
        "code": "COBERTURA",
        "name": "Cobertura e telhado",
        "dims": {
          "ESPECIALIDADE": ["TELHADOS", "IMPERMEABILIZACAO"],
          "VIATURA": ["SIM"]
        }
      },
      {
        "code": "MANUT",
        "name": "Manutenção",
        "dims": {
          "ESPECIALIDADE": ["MANUTENCAO"]
        }
      }
    ],
    "numberSeries": [
      {
        "code": "CUST",
        "description": "Customers",
        "lines": [
          {
            "id": "sly9v44",
            "start": "2026-01-01",
            "from": "CUST26000001",
            "to": "CUST26999999",
            "last": "CUST26000050",
            "closed": ""
          }
        ]
      },
      {
        "code": "VEND",
        "description": "Vendors",
        "lines": [
          {
            "id": "slvuhrg",
            "start": "2026-01-01",
            "from": "VEND26000001",
            "to": "VEND26999999",
            "last": "VEND26000010",
            "closed": ""
          }
        ]
      },
      {
        "code": "RES",
        "description": "Resources",
        "lines": [
          {
            "id": "sly097i",
            "start": "2026-01-01",
            "from": "RES26000001",
            "to": "RES26999999",
            "last": "RES26000015",
            "closed": ""
          }
        ]
      },
      {
        "code": "QUOTE",
        "description": "Quotes",
        "lines": [
          {
            "id": "slv0f2n",
            "start": "2026-01-01",
            "from": "QUOTE26000001",
            "to": "QUOTE26999999",
            "last": "",
            "closed": ""
          }
        ]
      }
    ],
    "seriesFor": {
      "customer": "CUST",
      "vendor": "VEND",
      "resource": "RES",
      "quote": "QUOTE"
    },
    "units": [
      {
        "code": "unit",
        "name": "Unit"
      },
      {
        "code": "L",
        "name": "Litre"
      },
      {
        "code": "kg",
        "name": "Kilogram"
      },
      {
        "code": "bag",
        "name": "Bag"
      },
      {
        "code": "can",
        "name": "Can"
      },
      {
        "code": "m",
        "name": "Metre"
      },
      {
        "code": "m²",
        "name": "Square metre"
      },
      {
        "code": "m³",
        "name": "Cubic metre"
      },
      {
        "code": "roll 100 m",
        "name": "Roll of 100 m"
      },
      {
        "code": "hour",
        "name": "Hour"
      },
      {
        "code": "day",
        "name": "Day"
      },
      {
        "code": "job",
        "name": "Per job"
      },
      {
        "code": "km",
        "name": "Kilometre"
      }
    ],
    "towns": [
      ["Lisboa", 38.722, -9.139],
      ["Restelo", 38.708, -9.208],
      ["Algés", 38.7026, -9.228],
      ["Amadora", 38.759, -9.24],
      ["Queluz", 38.7566, -9.2545],
      ["Oeiras", 38.705, -9.31],
      ["Carcavelos", 38.7, -9.335],
      ["Parede", 38.691, -9.354],
      ["Cascais", 38.705, -9.405],
      ["Sintra", 38.8029, -9.3817],
      ["Mem Martins", 38.79, -9.345],
      ["Loures", 38.8309, -9.1685],
      ["Odivelas", 38.793, -9.1838],
      ["Mafra", 38.937, -9.3277],
      ["Almada", 38.672, -9.157],
      ["Seixal", 38.64, -9.101],
      ["Barreiro", 38.655, -9.072],
      ["Setúbal", 38.5244, -8.8882]
    ],
    "collabRole": true
  },
  "roles": [
    {
      "id": "admin",
      "name": "Administrator",
      "description": "Full access. Manages users, roles and data. Can view the app as any user for testing.",
      "system": true,
      "perms": ["quotes.viewPipeline", "quotes.viewWork", "quotes.viewClosed", "customers.edit", "vendors.edit", "resources.price", "quotes.costs", "quotes.edit", "quotes.send", "work.manage", "work.addResources", "map.planner", "alerts.rules", "setup.edit", "users.manage", "data.manage"]
    },
    {
      "id": "ceo",
      "name": "CEO",
      "description": "Sees everything, approves and sends.",
      "perms": ["quotes.viewPipeline", "quotes.viewWork", "quotes.viewClosed", "customers.edit", "vendors.edit", "resources.price", "quotes.costs", "quotes.edit", "quotes.send", "work.manage", "map.planner", "alerts.rules", "setup.edit"]
    },
    {
      "id": "cto",
      "name": "CTO",
      "description": "Technical lead on quotes and work.",
      "perms": ["quotes.viewPipeline", "quotes.viewWork", "quotes.viewClosed", "customers.edit", "vendors.edit", "resources.price", "quotes.costs", "quotes.edit", "work.manage", "map.planner"]
    },
    {
      "id": "commercial",
      "name": "Commercial manager",
      "description": "Takes new quotes, visits sites, sends proposals.",
      "perms": ["quotes.viewPipeline", "quotes.edit", "quotes.send", "map.planner"]
    },
    {
      "id": "ops",
      "name": "Operations",
      "description": "Builds quotes and runs locked work.",
      "perms": ["quotes.viewPipeline", "quotes.viewWork", "quotes.costs", "quotes.edit", "work.manage", "map.planner"]
    },
    {
      "id": "collab",
      "name": "Collaborator",
      "description": "Works on site: records expenses (amount and receipt photo) on approved jobs until they are archived. Does not see the job’s values.",
      "perms": ["work.addResources"]
    },
    {
      "id": "finance",
      "name": "Finance",
      "description": "Costs, prices and invoicing.",
      "perms": ["quotes.viewPipeline", "quotes.viewWork", "quotes.viewClosed", "resources.price", "quotes.costs"]
    }
  ],
  "users": [
    {
      "id": "u1",
      "name": "Administrador",
      "email": "admin@foxbillions.pt",
      "password": "admin",
      "roles": ["admin"],
      "active": true,
      "lastLogin": null
    },
    {
      "id": "uqqlrw",
      "name": "Manuel Ferreira",
      "email": "manuel.ferreira@foxbillions.pt",
      "password": "colab",
      "roles": ["collab"],
      "active": true,
      "vendor": "vmliem",
      "lastLogin": null
    },
    {
      "id": "u2lisa",
      "name": "Rui Santos",
      "email": "rui.santos@foxbillions.pt",
      "password": "colab",
      "roles": ["collab"],
      "active": true,
      "vendor": "vbme41",
      "lastLogin": null
    },
    {
      "id": "ujzetn",
      "name": "Carlos Pinto",
      "email": "carlos.pinto@foxbillions.pt",
      "password": "colab",
      "roles": ["collab"],
      "active": true,
      "vendor": "vz47fv",
      "lastLogin": null
    },
    {
      "id": "uzuy8e",
      "name": "João Almeida",
      "email": "joao.almeida@foxbillions.pt",
      "password": "colab",
      "roles": ["collab"],
      "active": true,
      "vendor": "vj2omj",
      "lastLogin": null
    },
    {
      "id": "uo8g4h",
      "name": "Paulo Costa",
      "email": "paulo.costa@foxbillions.pt",
      "password": "colab",
      "roles": ["collab"],
      "active": true,
      "vendor": "v9c9ay",
      "lastLogin": null
    }
  ],
  "customers": [
    {
      "id": "c261s7",
      "no": "CUST26000001",
      "name": "Ana Ribeiro",
      "nif": "223456780",
      "phone": "914 556 120",
      "email": "ana.ribeiro@gmail.com",
      "billing": {
        "line1": "Rua Morais Soares 120, 3.º Esq.",
        "line2": "",
        "country": "Portugal",
        "city": "Lisboa",
        "postal": "1900-345"
      },
      "locations": [
        {
          "id": "loc1aymq",
          "name": "Casa — Arroios",
          "address": {
            "line1": "Rua Morais Soares 120, 3.º Esq.",
            "line2": "",
            "country": "Portugal",
            "city": "Lisboa",
            "postal": "1900-345"
          },
          "notes": ""
        },
        {
          "id": "locmjakl",
          "name": "Apartamento da Parede",
          "address": {
            "line1": "Av. da República 210, 1.º Dto.",
            "line2": "",
            "country": "Portugal",
            "city": "Parede",
            "postal": "2775-274"
          },
          "notes": "Chave com a vizinha do r/c"
        }
      ],
      "notes": "",
      "dims": {},
      "contacts": [
        {
          "id": "ctfeiik",
          "self": true,
          "name": "Ana Ribeiro",
          "role": "",
          "phone": "914 556 120",
          "email": "ana.ribeiro@gmail.com",
          "primary": true
        }
      ],
      "type": "person"
    },
    {
      "id": "cz17qv",
      "no": "CUST26000002",
      "name": "Condomínio Rua das Flores 12",
      "nif": "901234567",
      "phone": "213 420 115",
      "email": "condominio.flores12@gmail.com",
      "billing": {
        "line1": "Rua das Flores 12",
        "line2": "",
        "country": "Portugal",
        "city": "Lisboa",
        "postal": "1200-195"
      },
      "locations": [
        {
          "id": "locib16k",
          "name": "Prédio",
          "address": {
            "line1": "Rua das Flores 12",
            "line2": "",
            "country": "Portugal",
            "city": "Lisboa",
            "postal": "1200-195"
          },
          "notes": "Acesso à cobertura pela escada de serviço"
        }
      ],
      "notes": "",
      "dims": {},
      "contacts": [
        {
          "id": "ct2s52o",
          "self": true,
          "name": "Condomínio Rua das Flores 12",
          "role": "",
          "phone": "213 420 115",
          "email": "condominio.flores12@gmail.com",
          "primary": true
        },
        {
          "id": "ctywtkw",
          "name": "Luísa Matos",
          "role": "Administradora do condomínio",
          "phone": "936 120 450",
          "email": "luisa.matos@gestcondo.pt",
          "primary": false
        }
      ],
      "type": "company"
    },
    {
      "id": "cnoh4x",
      "no": "CUST26000003",
      "name": "Hotel Mar & Sol, S.A.",
      "nif": "503456789",
      "phone": "214 830 300",
      "email": "geral@hotelmaresol.pt",
      "billing": {
        "line1": "Av. Marginal 7650",
        "line2": "",
        "country": "Portugal",
        "city": "Cascais",
        "postal": "2750-286"
      },
      "locations": [
        {
          "id": "locaw45l",
          "name": "Hotel Cascais",
          "address": {
            "line1": "Av. Marginal 7650",
            "line2": "",
            "country": "Portugal",
            "city": "Cascais",
            "postal": "2750-286"
          },
          "notes": "Obras só entre as 9h e as 18h"
        },
        {
          "id": "locqu7my",
          "name": "Apartamentos Carcavelos",
          "address": {
            "line1": "Rua Dr. Manuel Arriaga 15",
            "line2": "",
            "country": "Portugal",
            "city": "Carcavelos",
            "postal": "2775-579"
          },
          "notes": ""
        }
      ],
      "notes": "",
      "dims": {},
      "contacts": [
        {
          "id": "ctw9rdg",
          "self": true,
          "name": "Hotel Mar & Sol, S.A.",
          "role": "",
          "phone": "214 830 300",
          "email": "geral@hotelmaresol.pt",
          "primary": true
        },
        {
          "id": "ctsryvy",
          "name": "Pedro Lopes",
          "role": "Manutenção",
          "phone": "912 300 880",
          "email": "manutencao@hotelmaresol.pt",
          "primary": false
        },
        {
          "id": "ctv0og0",
          "name": "Sofia Neves",
          "role": "Compras",
          "phone": "913 450 991",
          "email": "compras@hotelmaresol.pt",
          "primary": false
        }
      ],
      "type": "company"
    },
    {
      "id": "cqy4j1",
      "no": "CUST26000004",
      "name": "Padaria Estrela, Lda",
      "nif": "514321098",
      "phone": "214 410 252",
      "email": "padaria.estrela@sapo.pt",
      "billing": {
        "line1": "Rua Cândido dos Reis 98",
        "line2": "",
        "country": "Portugal",
        "city": "Oeiras",
        "postal": "2780-212"
      },
      "locations": [
        {
          "id": "locbfort",
          "name": "Loja Oeiras",
          "address": {
            "line1": "Rua Cândido dos Reis 98",
            "line2": "",
            "country": "Portugal",
            "city": "Oeiras",
            "postal": "2780-212"
          },
          "notes": ""
        },
        {
          "id": "locinttm",
          "name": "Loja Parede",
          "address": {
            "line1": "Rua Marquês de Pombal 41",
            "line2": "",
            "country": "Portugal",
            "city": "Parede",
            "postal": "2775-262"
          },
          "notes": ""
        },
        {
          "id": "locn58du",
          "name": "Armazém Carcavelos",
          "address": {
            "line1": "Rua de São Miguel 4",
            "line2": "",
            "country": "Portugal",
            "city": "Carcavelos",
            "postal": "2775-751"
          },
          "notes": "Cargas e descargas às 7h — evitar esse horário"
        }
      ],
      "notes": "",
      "dims": {},
      "contacts": [
        {
          "id": "ctbril2",
          "self": true,
          "name": "Padaria Estrela, Lda",
          "role": "",
          "phone": "214 410 252",
          "email": "padaria.estrela@sapo.pt",
          "primary": true
        },
        {
          "id": "ctvip36",
          "name": "Manuel Estrela",
          "role": "Gerente",
          "phone": "917 222 010",
          "email": "manuel@padariaestrela.pt",
          "primary": false
        }
      ],
      "type": "company"
    },
    {
      "id": "c2d704",
      "no": "CUST26000005",
      "name": "Escritórios Tejo, Lda",
      "nif": "515678901",
      "phone": "213 100 400",
      "email": "facilities@escritoriostejo.pt",
      "billing": {
        "line1": "Av. da Liberdade 190, 5.º",
        "line2": "",
        "country": "Portugal",
        "city": "Lisboa",
        "postal": "1250-147"
      },
      "locations": [
        {
          "id": "locws742",
          "name": "Sede — Av. da Liberdade",
          "address": {
            "line1": "Av. da Liberdade 190, 5.º",
            "line2": "",
            "country": "Portugal",
            "city": "Lisboa",
            "postal": "1250-147"
          },
          "notes": ""
        },
        {
          "id": "lochbs6o",
          "name": "Escritório Taguspark",
          "address": {
            "line1": "Av. Prof. Dr. Cavaco Silva 33",
            "line2": "",
            "country": "Portugal",
            "city": "Oeiras",
            "postal": "2740-120"
          },
          "notes": ""
        }
      ],
      "notes": "",
      "dims": {},
      "contacts": [
        {
          "id": "ctyecqa",
          "self": true,
          "name": "Escritórios Tejo, Lda",
          "role": "",
          "phone": "213 100 400",
          "email": "facilities@escritoriostejo.pt",
          "primary": true
        },
        {
          "id": "ctzfvmu",
          "name": "Ricardo Fonseca",
          "role": "Facilities",
          "phone": "915 678 112",
          "email": "ricardo.fonseca@escritoriostejo.pt",
          "primary": false
        },
        {
          "id": "cthptbo",
          "name": "Inês Carvalho",
          "role": "Contabilidade",
          "phone": "213 100 410",
          "email": "contabilidade@escritoriostejo.pt",
          "primary": false
        }
      ],
      "type": "company"
    },
    {
      "id": "c9s744",
      "no": "CUST26000006",
      "name": "Catarina Oliveira",
      "nif": "260181590",
      "phone": "961 318 609",
      "email": "catarina.oliveira@gmail.com",
      "billing": {
        "line1": "Av. da República 10",
        "line2": "",
        "country": "Portugal",
        "city": "Parede",
        "postal": "2775-274"
      },
      "locations": [
        {
          "id": "loco9ngw",
          "name": "Casa — Parede",
          "address": {
            "line1": "Av. da República 10",
            "line2": "",
            "country": "Portugal",
            "city": "Parede",
            "postal": "2775-274"
          },
          "notes": ""
        }
      ],
      "notes": "",
      "dims": {},
      "contacts": [
        {
          "id": "ct91k1e",
          "self": true,
          "name": "Catarina Oliveira",
          "role": "",
          "phone": "961 318 609",
          "email": "catarina.oliveira@gmail.com",
          "primary": true
        }
      ],
      "type": "person"
    },
    {
      "id": "ci3b4b",
      "no": "CUST26000007",
      "name": "Ana Martins",
      "nif": "290996030",
      "phone": "919 482 199",
      "email": "ana.martins@gmail.com",
      "billing": {
        "line1": "Av. 25 de Abril 75",
        "line2": "",
        "country": "Portugal",
        "city": "Cascais",
        "postal": "2750-511"
      },
      "locations": [
        {
          "id": "loco8ngv",
          "name": "Casa — Cascais",
          "address": {
            "line1": "Av. 25 de Abril 75",
            "line2": "",
            "country": "Portugal",
            "city": "Cascais",
            "postal": "2750-511"
          },
          "notes": ""
        }
      ],
      "notes": "",
      "dims": {},
      "contacts": [
        {
          "id": "ctnqzy2",
          "self": true,
          "name": "Ana Martins",
          "role": "",
          "phone": "919 482 199",
          "email": "ana.martins@gmail.com",
          "primary": true
        }
      ],
      "type": "person"
    },
    {
      "id": "c2oc7u",
      "no": "CUST26000008",
      "name": "Clínica Dentária Sorriso",
      "nif": "551819093",
      "phone": "217 543 231",
      "email": "clinica.dentaria.sorriso.pt@mail.pt",
      "billing": {
        "line1": "Rua Mouzinho de Albuquerque 110",
        "line2": "",
        "country": "Portugal",
        "city": "Oeiras",
        "postal": "2780-245"
      },
      "locations": [
        {
          "id": "locdxr4s",
          "name": "Loja — Oeiras",
          "address": {
            "line1": "Rua Mouzinho de Albuquerque 110",
            "line2": "",
            "country": "Portugal",
            "city": "Oeiras",
            "postal": "2780-245"
          },
          "notes": ""
        },
        {
          "id": "locmkn9t",
          "name": "Sede — Carcavelos",
          "address": {
            "line1": "Rua de São Miguel 237",
            "line2": "",
            "country": "Portugal",
            "city": "Carcavelos",
            "postal": "2775-751"
          },
          "notes": ""
        }
      ],
      "notes": "",
      "dims": {},
      "contacts": [
        {
          "id": "ct5y517",
          "self": true,
          "name": "Clínica Dentária Sorriso",
          "role": "",
          "phone": "217 543 231",
          "email": "clinica.dentaria.sorriso.pt@mail.pt",
          "primary": true
        },
        {
          "id": "ct25o0f",
          "name": "Teresa Alves",
          "role": "Responsável de manutenção",
          "phone": "965830794",
          "email": "",
          "primary": false
        }
      ],
      "type": "company"
    },
    {
      "id": "ckg7a9",
      "no": "CUST26000009",
      "name": "André Ferreira",
      "nif": "218625276",
      "phone": "935 597 971",
      "email": "andre.ferreira@gmail.com",
      "billing": {
        "line1": "Av. de Roma 196",
        "line2": "",
        "country": "Portugal",
        "city": "Lisboa",
        "postal": "1000-264"
      },
      "locations": [
        {
          "id": "locouq5a",
          "name": "Casa — Lisboa",
          "address": {
            "line1": "Av. de Roma 196",
            "line2": "",
            "country": "Portugal",
            "city": "Lisboa",
            "postal": "1000-264"
          },
          "notes": ""
        }
      ],
      "notes": "",
      "dims": {},
      "contacts": [
        {
          "id": "ct43ndg",
          "self": true,
          "name": "André Ferreira",
          "role": "",
          "phone": "935 597 971",
          "email": "andre.ferreira@gmail.com",
          "primary": true
        }
      ],
      "type": "person"
    },
    {
      "id": "cjaypo",
      "no": "CUST26000010",
      "name": "Pedro Jesus",
      "nif": "271049746",
      "phone": "924 236 671",
      "email": "pedro.jesus@gmail.com",
      "billing": {
        "line1": "Rua Marquês de Pombal 6",
        "line2": "",
        "country": "Portugal",
        "city": "Parede",
        "postal": "2775-262"
      },
      "locations": [
        {
          "id": "locq1ysa",
          "name": "Casa — Parede",
          "address": {
            "line1": "Rua Marquês de Pombal 6",
            "line2": "",
            "country": "Portugal",
            "city": "Parede",
            "postal": "2775-262"
          },
          "notes": ""
        },
        {
          "id": "loc6r45r",
          "name": "Apartamento — Cascais",
          "address": {
            "line1": "Av. 25 de Abril 157",
            "line2": "",
            "country": "Portugal",
            "city": "Cascais",
            "postal": "2750-511"
          },
          "notes": ""
        },
        {
          "id": "locok48r",
          "name": "Casa de férias — Lisboa",
          "address": {
            "line1": "Rua do Alecrim 16",
            "line2": "",
            "country": "Portugal",
            "city": "Lisboa",
            "postal": "1200-018"
          },
          "notes": ""
        }
      ],
      "notes": "",
      "dims": {},
      "contacts": [
        {
          "id": "ctevlqi",
          "self": true,
          "name": "Pedro Jesus",
          "role": "",
          "phone": "924 236 671",
          "email": "pedro.jesus@gmail.com",
          "primary": true
        }
      ],
      "type": "person"
    },
    {
      "id": "cvg3e1",
      "no": "CUST26000011",
      "name": "Restaurante O Pescador",
      "nif": "576842684",
      "phone": "212 233 079",
      "email": "restaurante.o.pescador.pt@mail.pt",
      "billing": {
        "line1": "Av. Jorge V 175",
        "line2": "",
        "country": "Portugal",
        "city": "Carcavelos",
        "postal": "2775-568"
      },
      "locations": [
        {
          "id": "locj3s5e",
          "name": "Loja — Carcavelos",
          "address": {
            "line1": "Av. Jorge V 175",
            "line2": "",
            "country": "Portugal",
            "city": "Carcavelos",
            "postal": "2775-568"
          },
          "notes": ""
        },
        {
          "id": "loc3p1cb",
          "name": "Sede — Oeiras",
          "address": {
            "line1": "Rua Cândido dos Reis 22",
            "line2": "",
            "country": "Portugal",
            "city": "Oeiras",
            "postal": "2780-212"
          },
          "notes": ""
        }
      ],
      "notes": "",
      "dims": {},
      "contacts": [
        {
          "id": "ctvieqp",
          "self": true,
          "name": "Restaurante O Pescador",
          "role": "",
          "phone": "212 233 079",
          "email": "restaurante.o.pescador.pt@mail.pt",
          "primary": true
        },
        {
          "id": "ctuoi8w",
          "name": "Bruno Silva",
          "role": "Gerente",
          "phone": "969968948",
          "email": "",
          "primary": false
        }
      ],
      "type": "company"
    },
    {
      "id": "cn3kf8",
      "no": "CUST26000012",
      "name": "Nuno Carvalho",
      "nif": "295289078",
      "phone": "960 313 721",
      "email": "nuno.carvalho@gmail.com",
      "billing": {
        "line1": "Av. Salvador Allende 101",
        "line2": "",
        "country": "Portugal",
        "city": "Oeiras",
        "postal": "2780-163"
      },
      "locations": [
        {
          "id": "loc46a4c",
          "name": "Casa — Oeiras",
          "address": {
            "line1": "Av. Salvador Allende 101",
            "line2": "",
            "country": "Portugal",
            "city": "Oeiras",
            "postal": "2780-163"
          },
          "notes": ""
        }
      ],
      "notes": "",
      "dims": {},
      "contacts": [
        {
          "id": "ct1tvwg",
          "self": true,
          "name": "Nuno Carvalho",
          "role": "",
          "phone": "960 313 721",
          "email": "nuno.carvalho@gmail.com",
          "primary": true
        }
      ],
      "type": "person"
    },
    {
      "id": "cgnn9s",
      "no": "CUST26000013",
      "name": "Café Central",
      "nif": "990109281",
      "phone": "213 962 459",
      "email": "cafe.central.pt@mail.pt",
      "billing": {
        "line1": "Rua Sampaio Bruno 7",
        "line2": "",
        "country": "Portugal",
        "city": "Parede",
        "postal": "2775-279"
      },
      "locations": [
        {
          "id": "loc7vfe5",
          "name": "Loja — Parede",
          "address": {
            "line1": "Rua Sampaio Bruno 7",
            "line2": "",
            "country": "Portugal",
            "city": "Parede",
            "postal": "2775-279"
          },
          "notes": ""
        }
      ],
      "notes": "",
      "dims": {},
      "contacts": [
        {
          "id": "ctg0844",
          "self": true,
          "name": "Café Central",
          "role": "",
          "phone": "213 962 459",
          "email": "cafe.central.pt@mail.pt",
          "primary": true
        },
        {
          "id": "ctzydsk",
          "name": "Ana Pereira",
          "role": "Responsável de manutenção",
          "phone": "969059692",
          "email": "",
          "primary": false
        }
      ],
      "type": "company"
    },
    {
      "id": "c5x968",
      "no": "CUST26000014",
      "name": "Filipe Sousa",
      "nif": "212154728",
      "phone": "914 852 538",
      "email": "filipe.sousa@gmail.com",
      "billing": {
        "line1": "Rua de Campo de Ourique 38",
        "line2": "",
        "country": "Portugal",
        "city": "Lisboa",
        "postal": "1250-061"
      },
      "locations": [
        {
          "id": "locwq40x",
          "name": "Casa — Lisboa",
          "address": {
            "line1": "Rua de Campo de Ourique 38",
            "line2": "",
            "country": "Portugal",
            "city": "Lisboa",
            "postal": "1250-061"
          },
          "notes": ""
        },
        {
          "id": "locrf5qk",
          "name": "Apartamento — Lisboa",
          "address": {
            "line1": "Rua da Graça 165",
            "line2": "",
            "country": "Portugal",
            "city": "Lisboa",
            "postal": "1170-165"
          },
          "notes": ""
        }
      ],
      "notes": "",
      "dims": {},
      "contacts": [
        {
          "id": "cthcrd3",
          "self": true,
          "name": "Filipe Sousa",
          "role": "",
          "phone": "914 852 538",
          "email": "filipe.sousa@gmail.com",
          "primary": true
        }
      ],
      "type": "person"
    },
    {
      "id": "c9xbba",
      "no": "CUST26000015",
      "name": "Hugo Nunes",
      "nif": "285393363",
      "phone": "933 957 551",
      "email": "hugo.nunes@gmail.com",
      "billing": {
        "line1": "Rua do Alecrim 92",
        "line2": "",
        "country": "Portugal",
        "city": "Lisboa",
        "postal": "1200-018"
      },
      "locations": [
        {
          "id": "locmu2a5",
          "name": "Casa — Lisboa",
          "address": {
            "line1": "Rua do Alecrim 92",
            "line2": "",
            "country": "Portugal",
            "city": "Lisboa",
            "postal": "1200-018"
          },
          "notes": ""
        },
        {
          "id": "loc5b8ha",
          "name": "Apartamento — Lisboa",
          "address": {
            "line1": "Rua da Graça 121",
            "line2": "",
            "country": "Portugal",
            "city": "Lisboa",
            "postal": "1170-165"
          },
          "notes": ""
        }
      ],
      "notes": "",
      "dims": {},
      "contacts": [
        {
          "id": "ct58vmm",
          "self": true,
          "name": "Hugo Nunes",
          "role": "",
          "phone": "933 957 551",
          "email": "hugo.nunes@gmail.com",
          "primary": true
        }
      ],
      "type": "person"
    },
    {
      "id": "ci92dr",
      "no": "CUST26000016",
      "name": "Miguel Pereira",
      "nif": "237353799",
      "phone": "963 726 516",
      "email": "miguel.pereira@gmail.com",
      "billing": {
        "line1": "Av. Jorge V 233",
        "line2": "",
        "country": "Portugal",
        "city": "Carcavelos",
        "postal": "2775-568"
      },
      "locations": [
        {
          "id": "lociyl8d",
          "name": "Casa — Carcavelos",
          "address": {
            "line1": "Av. Jorge V 233",
            "line2": "",
            "country": "Portugal",
            "city": "Carcavelos",
            "postal": "2775-568"
          },
          "notes": ""
        },
        {
          "id": "locn50dy",
          "name": "Apartamento — Lisboa",
          "address": {
            "line1": "Av. de Roma 233",
            "line2": "",
            "country": "Portugal",
            "city": "Lisboa",
            "postal": "1000-264"
          },
          "notes": ""
        }
      ],
      "notes": "",
      "dims": {},
      "contacts": [
        {
          "id": "ctspyp5",
          "self": true,
          "name": "Miguel Pereira",
          "role": "",
          "phone": "963 726 516",
          "email": "miguel.pereira@gmail.com",
          "primary": true
        }
      ],
      "type": "person"
    },
    {
      "id": "ca1huu",
      "no": "CUST26000017",
      "name": "Farmácia Parede",
      "nif": "961222029",
      "phone": "215 288 200",
      "email": "farmacia.parede.pt@mail.pt",
      "billing": {
        "line1": "Rua Sampaio Bruno 38",
        "line2": "",
        "country": "Portugal",
        "city": "Parede",
        "postal": "2775-279"
      },
      "locations": [
        {
          "id": "locoqs4b",
          "name": "Loja — Parede",
          "address": {
            "line1": "Rua Sampaio Bruno 38",
            "line2": "",
            "country": "Portugal",
            "city": "Parede",
            "postal": "2775-279"
          },
          "notes": ""
        },
        {
          "id": "loc77op5",
          "name": "Sede — Parede",
          "address": {
            "line1": "Rua Marquês de Pombal 169",
            "line2": "",
            "country": "Portugal",
            "city": "Parede",
            "postal": "2775-262"
          },
          "notes": ""
        }
      ],
      "notes": "",
      "dims": {},
      "contacts": [
        {
          "id": "ctcp3a3",
          "self": true,
          "name": "Farmácia Parede",
          "role": "",
          "phone": "215 288 200",
          "email": "farmacia.parede.pt@mail.pt",
          "primary": true
        }
      ],
      "type": "company"
    },
    {
      "id": "cg2zy5",
      "no": "CUST26000018",
      "name": "Diogo Teixeira",
      "nif": "218263304",
      "phone": "938 620 579",
      "email": "diogo.teixeira@gmail.com",
      "billing": {
        "line1": "Av. Almirante Reis 196",
        "line2": "",
        "country": "Portugal",
        "city": "Lisboa",
        "postal": "1150-018"
      },
      "locations": [
        {
          "id": "locs95ih",
          "name": "Casa — Lisboa",
          "address": {
            "line1": "Av. Almirante Reis 196",
            "line2": "",
            "country": "Portugal",
            "city": "Lisboa",
            "postal": "1150-018"
          },
          "notes": ""
        }
      ],
      "notes": "",
      "dims": {},
      "contacts": [
        {
          "id": "ctxrv0e",
          "self": true,
          "name": "Diogo Teixeira",
          "role": "",
          "phone": "938 620 579",
          "email": "diogo.teixeira@gmail.com",
          "primary": true
        }
      ],
      "type": "person"
    },
    {
      "id": "cq6lji",
      "no": "CUST26000019",
      "name": "Teresa Lopes",
      "nif": "282828807",
      "phone": "969 180 588",
      "email": "teresa.lopes@gmail.com",
      "billing": {
        "line1": "Rua de São Miguel 2",
        "line2": "",
        "country": "Portugal",
        "city": "Carcavelos",
        "postal": "2775-751"
      },
      "locations": [
        {
          "id": "lockp107",
          "name": "Casa — Carcavelos",
          "address": {
            "line1": "Rua de São Miguel 2",
            "line2": "",
            "country": "Portugal",
            "city": "Carcavelos",
            "postal": "2775-751"
          },
          "notes": ""
        },
        {
          "id": "loc8jm82",
          "name": "Apartamento — Oeiras",
          "address": {
            "line1": "Rua Cândido dos Reis 37",
            "line2": "",
            "country": "Portugal",
            "city": "Oeiras",
            "postal": "2780-212"
          },
          "notes": ""
        }
      ],
      "notes": "",
      "dims": {},
      "contacts": [
        {
          "id": "cts80pm",
          "self": true,
          "name": "Teresa Lopes",
          "role": "",
          "phone": "969 180 588",
          "email": "teresa.lopes@gmail.com",
          "primary": true
        }
      ],
      "type": "person"
    },
    {
      "id": "cs2owz",
      "no": "CUST26000020",
      "name": "Escola de Línguas Atlântico",
      "nif": "918033401",
      "phone": "219 898 347",
      "email": "escola.de.linguas.atlântico.pt@mail.pt",
      "billing": {
        "line1": "Rua Mouzinho de Albuquerque 8",
        "line2": "",
        "country": "Portugal",
        "city": "Oeiras",
        "postal": "2780-245"
      },
      "locations": [
        {
          "id": "loclqzcf",
          "name": "Loja — Oeiras",
          "address": {
            "line1": "Rua Mouzinho de Albuquerque 8",
            "line2": "",
            "country": "Portugal",
            "city": "Oeiras",
            "postal": "2780-245"
          },
          "notes": ""
        },
        {
          "id": "locm8fby",
          "name": "Sede — Lisboa",
          "address": {
            "line1": "Rua do Alecrim 84",
            "line2": "",
            "country": "Portugal",
            "city": "Lisboa",
            "postal": "1200-018"
          },
          "notes": ""
        }
      ],
      "notes": "",
      "dims": {},
      "contacts": [
        {
          "id": "cti4jhq",
          "self": true,
          "name": "Escola de Línguas Atlântico",
          "role": "",
          "phone": "219 898 347",
          "email": "escola.de.linguas.atlântico.pt@mail.pt",
          "primary": true
        },
        {
          "id": "ctfhs70",
          "name": "Filipe Almeida",
          "role": "Gerente",
          "phone": "934398871",
          "email": "",
          "primary": false
        }
      ],
      "type": "company"
    },
    {
      "id": "cswu5n",
      "no": "CUST26000021",
      "name": "Marta Oliveira",
      "nif": "261675136",
      "phone": "925 242 731",
      "email": "marta.oliveira@gmail.com",
      "billing": {
        "line1": "Rua da Graça 201",
        "line2": "",
        "country": "Portugal",
        "city": "Lisboa",
        "postal": "1170-165"
      },
      "locations": [
        {
          "id": "locj8rag",
          "name": "Casa — Lisboa",
          "address": {
            "line1": "Rua da Graça 201",
            "line2": "",
            "country": "Portugal",
            "city": "Lisboa",
            "postal": "1170-165"
          },
          "notes": ""
        }
      ],
      "notes": "",
      "dims": {},
      "contacts": [
        {
          "id": "cthheoo",
          "self": true,
          "name": "Marta Oliveira",
          "role": "",
          "phone": "925 242 731",
          "email": "marta.oliveira@gmail.com",
          "primary": true
        }
      ],
      "type": "person"
    },
    {
      "id": "cdtrgp",
      "no": "CUST26000022",
      "name": "Ginásio Forma Viva",
      "nif": "972326865",
      "phone": "215 058 770",
      "email": "ginasio.forma.viva.pt@mail.pt",
      "billing": {
        "line1": "Av. Salvador Allende 82",
        "line2": "",
        "country": "Portugal",
        "city": "Oeiras",
        "postal": "2780-163"
      },
      "locations": [
        {
          "id": "loc5eu9n",
          "name": "Loja — Oeiras",
          "address": {
            "line1": "Av. Salvador Allende 82",
            "line2": "",
            "country": "Portugal",
            "city": "Oeiras",
            "postal": "2780-163"
          },
          "notes": ""
        }
      ],
      "notes": "",
      "dims": {},
      "contacts": [
        {
          "id": "ct6iu7c",
          "self": true,
          "name": "Ginásio Forma Viva",
          "role": "",
          "phone": "215 058 770",
          "email": "ginasio.forma.viva.pt@mail.pt",
          "primary": true
        },
        {
          "id": "ctil6uo",
          "name": "Teresa Carvalho",
          "role": "Responsável de manutenção",
          "phone": "912893308",
          "email": "",
          "primary": false
        }
      ],
      "type": "company"
    },
    {
      "id": "chvxhm",
      "no": "CUST26000023",
      "name": "Sara Santos",
      "nif": "224264628",
      "phone": "926 140 141",
      "email": "sara.santos@gmail.com",
      "billing": {
        "line1": "Rua Sampaio Bruno 127",
        "line2": "",
        "country": "Portugal",
        "city": "Parede",
        "postal": "2775-279"
      },
      "locations": [
        {
          "id": "locajb4s",
          "name": "Casa — Parede",
          "address": {
            "line1": "Rua Sampaio Bruno 127",
            "line2": "",
            "country": "Portugal",
            "city": "Parede",
            "postal": "2775-279"
          },
          "notes": ""
        },
        {
          "id": "loctnu4v",
          "name": "Apartamento — Lisboa",
          "address": {
            "line1": "Rua da Graça 15",
            "line2": "",
            "country": "Portugal",
            "city": "Lisboa",
            "postal": "1170-165"
          },
          "notes": ""
        }
      ],
      "notes": "",
      "dims": {},
      "contacts": [
        {
          "id": "cthzl46",
          "self": true,
          "name": "Sara Santos",
          "role": "",
          "phone": "926 140 141",
          "email": "sara.santos@gmail.com",
          "primary": true
        }
      ],
      "type": "person"
    },
    {
      "id": "cbb7p1",
      "no": "CUST26000024",
      "name": "André Martins",
      "nif": "214170586",
      "phone": "921 240 234",
      "email": "andre.martins@gmail.com",
      "billing": {
        "line1": "Rua Marquês de Pombal 160",
        "line2": "",
        "country": "Portugal",
        "city": "Parede",
        "postal": "2775-262"
      },
      "locations": [
        {
          "id": "locpl7zp",
          "name": "Casa — Parede",
          "address": {
            "line1": "Rua Marquês de Pombal 160",
            "line2": "",
            "country": "Portugal",
            "city": "Parede",
            "postal": "2775-262"
          },
          "notes": ""
        }
      ],
      "notes": "",
      "dims": {},
      "contacts": [
        {
          "id": "ct1p3ha",
          "self": true,
          "name": "André Martins",
          "role": "",
          "phone": "921 240 234",
          "email": "andre.martins@gmail.com",
          "primary": true
        }
      ],
      "type": "person"
    },
    {
      "id": "cd4ugy",
      "no": "CUST26000025",
      "name": "Sofia Sousa",
      "nif": "283478245",
      "phone": "928 737 167",
      "email": "sofia.sousa@gmail.com",
      "billing": {
        "line1": "Av. Jorge V 10",
        "line2": "",
        "country": "Portugal",
        "city": "Carcavelos",
        "postal": "2775-568"
      },
      "locations": [
        {
          "id": "loccmlob",
          "name": "Casa — Carcavelos",
          "address": {
            "line1": "Av. Jorge V 10",
            "line2": "",
            "country": "Portugal",
            "city": "Carcavelos",
            "postal": "2775-568"
          },
          "notes": ""
        }
      ],
      "notes": "",
      "dims": {},
      "contacts": [
        {
          "id": "cthpabu",
          "self": true,
          "name": "Sofia Sousa",
          "role": "",
          "phone": "928 737 167",
          "email": "sofia.sousa@gmail.com",
          "primary": true
        }
      ],
      "type": "person"
    },
    {
      "id": "cx3t4v",
      "no": "CUST26000026",
      "name": "Imobiliária Casa Nova",
      "nif": "984335326",
      "phone": "211 462 016",
      "email": "imobiliaria.casa.nova.pt@mail.pt",
      "billing": {
        "line1": "Av. da República 215",
        "line2": "",
        "country": "Portugal",
        "city": "Parede",
        "postal": "2775-274"
      },
      "locations": [
        {
          "id": "loce312j",
          "name": "Loja — Parede",
          "address": {
            "line1": "Av. da República 215",
            "line2": "",
            "country": "Portugal",
            "city": "Parede",
            "postal": "2775-274"
          },
          "notes": ""
        }
      ],
      "notes": "",
      "dims": {},
      "contacts": [
        {
          "id": "ctfokat",
          "self": true,
          "name": "Imobiliária Casa Nova",
          "role": "",
          "phone": "211 462 016",
          "email": "imobiliaria.casa.nova.pt@mail.pt",
          "primary": true
        }
      ],
      "type": "company"
    },
    {
      "id": "c5cxsu",
      "no": "CUST26000027",
      "name": "Gonçalo Sousa",
      "nif": "293407224",
      "phone": "932 056 174",
      "email": "goncalo.sousa@gmail.com",
      "billing": {
        "line1": "Av. Salvador Allende 94",
        "line2": "",
        "country": "Portugal",
        "city": "Oeiras",
        "postal": "2780-163"
      },
      "locations": [
        {
          "id": "lock99jc",
          "name": "Casa — Oeiras",
          "address": {
            "line1": "Av. Salvador Allende 94",
            "line2": "",
            "country": "Portugal",
            "city": "Oeiras",
            "postal": "2780-163"
          },
          "notes": ""
        },
        {
          "id": "locp59bu",
          "name": "Apartamento — Parede",
          "address": {
            "line1": "Rua Marquês de Pombal 63",
            "line2": "",
            "country": "Portugal",
            "city": "Parede",
            "postal": "2775-262"
          },
          "notes": ""
        },
        {
          "id": "locnzu2z",
          "name": "Casa de férias — Lisboa",
          "address": {
            "line1": "Rua da Graça 56",
            "line2": "",
            "country": "Portugal",
            "city": "Lisboa",
            "postal": "1170-165"
          },
          "notes": ""
        }
      ],
      "notes": "",
      "dims": {},
      "contacts": [
        {
          "id": "ctxyv02",
          "self": true,
          "name": "Gonçalo Sousa",
          "role": "",
          "phone": "932 056 174",
          "email": "goncalo.sousa@gmail.com",
          "primary": true
        }
      ],
      "type": "person"
    },
    {
      "id": "c83ifd",
      "no": "CUST26000028",
      "name": "Teresa Teixeira",
      "nif": "233801412",
      "phone": "933 198 296",
      "email": "teresa.teixeira@gmail.com",
      "billing": {
        "line1": "Rua Cândido dos Reis 101",
        "line2": "",
        "country": "Portugal",
        "city": "Oeiras",
        "postal": "2780-212"
      },
      "locations": [
        {
          "id": "loc5b9l5",
          "name": "Casa — Oeiras",
          "address": {
            "line1": "Rua Cândido dos Reis 101",
            "line2": "",
            "country": "Portugal",
            "city": "Oeiras",
            "postal": "2780-212"
          },
          "notes": ""
        }
      ],
      "notes": "",
      "dims": {},
      "contacts": [
        {
          "id": "ct2y6al",
          "self": true,
          "name": "Teresa Teixeira",
          "role": "",
          "phone": "933 198 296",
          "email": "teresa.teixeira@gmail.com",
          "primary": true
        }
      ],
      "type": "person"
    },
    {
      "id": "cv2wei",
      "no": "CUST26000029",
      "name": "Hostel Lisboa Azul",
      "nif": "972492086",
      "phone": "210 025 167",
      "email": "hostel.lisboa.azul.pt@mail.pt",
      "billing": {
        "line1": "Rua de São Miguel 36",
        "line2": "",
        "country": "Portugal",
        "city": "Carcavelos",
        "postal": "2775-751"
      },
      "locations": [
        {
          "id": "loccx8pr",
          "name": "Loja — Carcavelos",
          "address": {
            "line1": "Rua de São Miguel 36",
            "line2": "",
            "country": "Portugal",
            "city": "Carcavelos",
            "postal": "2775-751"
          },
          "notes": ""
        },
        {
          "id": "lochzaf5",
          "name": "Sede — Parede",
          "address": {
            "line1": "Rua Sampaio Bruno 214",
            "line2": "",
            "country": "Portugal",
            "city": "Parede",
            "postal": "2775-279"
          },
          "notes": ""
        },
        {
          "id": "locw8ndi",
          "name": "Armazém — Lisboa",
          "address": {
            "line1": "Av. Almirante Reis 22",
            "line2": "",
            "country": "Portugal",
            "city": "Lisboa",
            "postal": "1150-018"
          },
          "notes": ""
        }
      ],
      "notes": "",
      "dims": {},
      "contacts": [
        {
          "id": "ctumgdc",
          "self": true,
          "name": "Hostel Lisboa Azul",
          "role": "",
          "phone": "210 025 167",
          "email": "hostel.lisboa.azul.pt@mail.pt",
          "primary": true
        },
        {
          "id": "ctye688",
          "name": "Sofia Silva",
          "role": "Administração",
          "phone": "929208996",
          "email": "",
          "primary": false
        }
      ],
      "type": "company"
    },
    {
      "id": "cmxjam",
      "no": "CUST26000030",
      "name": "Sara Silva",
      "nif": "271881817",
      "phone": "923 776 174",
      "email": "sara.silva@gmail.com",
      "billing": {
        "line1": "Av. de Roma 217",
        "line2": "",
        "country": "Portugal",
        "city": "Lisboa",
        "postal": "1000-264"
      },
      "locations": [
        {
          "id": "loci9h9t",
          "name": "Casa — Lisboa",
          "address": {
            "line1": "Av. de Roma 217",
            "line2": "",
            "country": "Portugal",
            "city": "Lisboa",
            "postal": "1000-264"
          },
          "notes": ""
        }
      ],
      "notes": "",
      "dims": {},
      "contacts": [
        {
          "id": "ctx7r3t",
          "self": true,
          "name": "Sara Silva",
          "role": "",
          "phone": "923 776 174",
          "email": "sara.silva@gmail.com",
          "primary": true
        }
      ],
      "type": "person"
    },
    {
      "id": "coq4gv",
      "no": "CUST26000031",
      "name": "Ótica Visão Clara",
      "nif": "593192544",
      "phone": "217 413 748",
      "email": "otica.visao.clara.pt@mail.pt",
      "billing": {
        "line1": "Av. 25 de Abril 4",
        "line2": "",
        "country": "Portugal",
        "city": "Cascais",
        "postal": "2750-511"
      },
      "locations": [
        {
          "id": "loc6qq5a",
          "name": "Loja — Cascais",
          "address": {
            "line1": "Av. 25 de Abril 4",
            "line2": "",
            "country": "Portugal",
            "city": "Cascais",
            "postal": "2750-511"
          },
          "notes": ""
        }
      ],
      "notes": "",
      "dims": {},
      "contacts": [
        {
          "id": "ctgluch",
          "self": true,
          "name": "Ótica Visão Clara",
          "role": "",
          "phone": "217 413 748",
          "email": "otica.visao.clara.pt@mail.pt",
          "primary": true
        },
        {
          "id": "ctkfzcr",
          "name": "Marta Marques",
          "role": "Gerente",
          "phone": "926229033",
          "email": "",
          "primary": false
        }
      ],
      "type": "company"
    },
    {
      "id": "c7fgcp",
      "no": "CUST26000032",
      "name": "Pedro Alves",
      "nif": "204718746",
      "phone": "928 452 984",
      "email": "pedro.alves@gmail.com",
      "billing": {
        "line1": "Av. Almirante Reis 20",
        "line2": "",
        "country": "Portugal",
        "city": "Lisboa",
        "postal": "1150-018"
      },
      "locations": [
        {
          "id": "loch6taw",
          "name": "Casa — Lisboa",
          "address": {
            "line1": "Av. Almirante Reis 20",
            "line2": "",
            "country": "Portugal",
            "city": "Lisboa",
            "postal": "1150-018"
          },
          "notes": ""
        }
      ],
      "notes": "",
      "dims": {},
      "contacts": [
        {
          "id": "cttbl0p",
          "self": true,
          "name": "Pedro Alves",
          "role": "",
          "phone": "928 452 984",
          "email": "pedro.alves@gmail.com",
          "primary": true
        }
      ],
      "type": "person"
    },
    {
      "id": "ccb84v",
      "no": "CUST26000033",
      "name": "Ana Correia",
      "nif": "253776020",
      "phone": "926 565 150",
      "email": "ana.correia@gmail.com",
      "billing": {
        "line1": "Rua Sampaio Bruno 116",
        "line2": "",
        "country": "Portugal",
        "city": "Parede",
        "postal": "2775-279"
      },
      "locations": [
        {
          "id": "locj4p9i",
          "name": "Casa — Parede",
          "address": {
            "line1": "Rua Sampaio Bruno 116",
            "line2": "",
            "country": "Portugal",
            "city": "Parede",
            "postal": "2775-279"
          },
          "notes": ""
        }
      ],
      "notes": "",
      "dims": {},
      "contacts": [
        {
          "id": "ctj8rbw",
          "self": true,
          "name": "Ana Correia",
          "role": "",
          "phone": "926 565 150",
          "email": "ana.correia@gmail.com",
          "primary": true
        }
      ],
      "type": "person"
    },
    {
      "id": "c0bilu",
      "no": "CUST26000034",
      "name": "Catarina Nunes",
      "nif": "256130445",
      "phone": "936 404 104",
      "email": "catarina.nunes@gmail.com",
      "billing": {
        "line1": "Av. da Igreja 223",
        "line2": "",
        "country": "Portugal",
        "city": "Lisboa",
        "postal": "1700-235"
      },
      "locations": [
        {
          "id": "loc0xu2y",
          "name": "Casa — Lisboa",
          "address": {
            "line1": "Av. da Igreja 223",
            "line2": "",
            "country": "Portugal",
            "city": "Lisboa",
            "postal": "1700-235"
          },
          "notes": ""
        }
      ],
      "notes": "",
      "dims": {},
      "contacts": [
        {
          "id": "ctc37i7",
          "self": true,
          "name": "Catarina Nunes",
          "role": "",
          "phone": "936 404 104",
          "email": "catarina.nunes@gmail.com",
          "primary": true
        }
      ],
      "type": "person"
    },
    {
      "id": "cy9cny",
      "no": "CUST26000035",
      "name": "Pastelaria Doce Lar",
      "nif": "534685356",
      "phone": "216 792 470",
      "email": "pastelaria.doce.lar.pt@mail.pt",
      "billing": {
        "line1": "Rua Sampaio Bruno 103",
        "line2": "",
        "country": "Portugal",
        "city": "Parede",
        "postal": "2775-279"
      },
      "locations": [
        {
          "id": "loc7dy52",
          "name": "Loja — Parede",
          "address": {
            "line1": "Rua Sampaio Bruno 103",
            "line2": "",
            "country": "Portugal",
            "city": "Parede",
            "postal": "2775-279"
          },
          "notes": ""
        },
        {
          "id": "locxjlz8",
          "name": "Sede — Parede",
          "address": {
            "line1": "Rua Sampaio Bruno 53",
            "line2": "",
            "country": "Portugal",
            "city": "Parede",
            "postal": "2775-279"
          },
          "notes": ""
        },
        {
          "id": "locxxfvj",
          "name": "Armazém — Lisboa",
          "address": {
            "line1": "Rua Augusta 239",
            "line2": "",
            "country": "Portugal",
            "city": "Lisboa",
            "postal": "1100-053"
          },
          "notes": ""
        }
      ],
      "notes": "",
      "dims": {},
      "contacts": [
        {
          "id": "ct43yco",
          "self": true,
          "name": "Pastelaria Doce Lar",
          "role": "",
          "phone": "216 792 470",
          "email": "pastelaria.doce.lar.pt@mail.pt",
          "primary": true
        }
      ],
      "type": "company"
    },
    {
      "id": "cy82rz",
      "no": "CUST26000036",
      "name": "Hugo Oliveira",
      "nif": "227654444",
      "phone": "961 221 387",
      "email": "hugo.oliveira@gmail.com",
      "billing": {
        "line1": "Rua Cândido dos Reis 78",
        "line2": "",
        "country": "Portugal",
        "city": "Oeiras",
        "postal": "2780-212"
      },
      "locations": [
        {
          "id": "loctzcur",
          "name": "Casa — Oeiras",
          "address": {
            "line1": "Rua Cândido dos Reis 78",
            "line2": "",
            "country": "Portugal",
            "city": "Oeiras",
            "postal": "2780-212"
          },
          "notes": ""
        }
      ],
      "notes": "",
      "dims": {},
      "contacts": [
        {
          "id": "ctn0q3h",
          "self": true,
          "name": "Hugo Oliveira",
          "role": "",
          "phone": "961 221 387",
          "email": "hugo.oliveira@gmail.com",
          "primary": true
        }
      ],
      "type": "person"
    },
    {
      "id": "c8m95k",
      "no": "CUST26000037",
      "name": "Hugo Martins",
      "nif": "275762833",
      "phone": "925 493 066",
      "email": "hugo.martins@gmail.com",
      "billing": {
        "line1": "Rua de Campo de Ourique 143",
        "line2": "",
        "country": "Portugal",
        "city": "Lisboa",
        "postal": "1250-061"
      },
      "locations": [
        {
          "id": "locsfs3j",
          "name": "Casa — Lisboa",
          "address": {
            "line1": "Rua de Campo de Ourique 143",
            "line2": "",
            "country": "Portugal",
            "city": "Lisboa",
            "postal": "1250-061"
          },
          "notes": ""
        }
      ],
      "notes": "",
      "dims": {},
      "contacts": [
        {
          "id": "ct3nh1k",
          "self": true,
          "name": "Hugo Martins",
          "role": "",
          "phone": "925 493 066",
          "email": "hugo.martins@gmail.com",
          "primary": true
        }
      ],
      "type": "person"
    },
    {
      "id": "cnnc2i",
      "no": "CUST26000038",
      "name": "Condomínio Edifício Mar",
      "nif": "983645074",
      "phone": "213 143 667",
      "email": "condominio.edificio.mar.pt@mail.pt",
      "billing": {
        "line1": "Rua Frederico Arouca 33",
        "line2": "",
        "country": "Portugal",
        "city": "Cascais",
        "postal": "2750-355"
      },
      "locations": [
        {
          "id": "locppgw6",
          "name": "Loja — Cascais",
          "address": {
            "line1": "Rua Frederico Arouca 33",
            "line2": "",
            "country": "Portugal",
            "city": "Cascais",
            "postal": "2750-355"
          },
          "notes": ""
        },
        {
          "id": "locgc4s6",
          "name": "Sede — Parede",
          "address": {
            "line1": "Rua Sampaio Bruno 203",
            "line2": "",
            "country": "Portugal",
            "city": "Parede",
            "postal": "2775-279"
          },
          "notes": ""
        }
      ],
      "notes": "",
      "dims": {},
      "contacts": [
        {
          "id": "ctyq608",
          "self": true,
          "name": "Condomínio Edifício Mar",
          "role": "",
          "phone": "213 143 667",
          "email": "condominio.edificio.mar.pt@mail.pt",
          "primary": true
        },
        {
          "id": "ctt4mv2",
          "name": "Bruno Silva",
          "role": "Gerente",
          "phone": "918133670",
          "email": "",
          "primary": false
        }
      ],
      "type": "company"
    },
    {
      "id": "c0h4j2",
      "no": "CUST26000039",
      "name": "Carla Nunes",
      "nif": "279701687",
      "phone": "922 817 180",
      "email": "carla.nunes@gmail.com",
      "billing": {
        "line1": "Av. da República 201",
        "line2": "",
        "country": "Portugal",
        "city": "Parede",
        "postal": "2775-274"
      },
      "locations": [
        {
          "id": "locmt2sh",
          "name": "Casa — Parede",
          "address": {
            "line1": "Av. da República 201",
            "line2": "",
            "country": "Portugal",
            "city": "Parede",
            "postal": "2775-274"
          },
          "notes": ""
        }
      ],
      "notes": "",
      "dims": {},
      "contacts": [
        {
          "id": "ct838ht",
          "self": true,
          "name": "Carla Nunes",
          "role": "",
          "phone": "922 817 180",
          "email": "carla.nunes@gmail.com",
          "primary": true
        }
      ],
      "type": "person"
    },
    {
      "id": "c07c48",
      "no": "CUST26000040",
      "name": "Condomínio Torre Oeiras",
      "nif": "523904248",
      "phone": "211 489 364",
      "email": "condominio.torre.oeiras.pt@mail.pt",
      "billing": {
        "line1": "Av. Valbom 196",
        "line2": "",
        "country": "Portugal",
        "city": "Cascais",
        "postal": "2750-508"
      },
      "locations": [
        {
          "id": "loc67h4o",
          "name": "Loja — Cascais",
          "address": {
            "line1": "Av. Valbom 196",
            "line2": "",
            "country": "Portugal",
            "city": "Cascais",
            "postal": "2750-508"
          },
          "notes": ""
        }
      ],
      "notes": "",
      "dims": {},
      "contacts": [
        {
          "id": "ctm3b62",
          "self": true,
          "name": "Condomínio Torre Oeiras",
          "role": "",
          "phone": "211 489 364",
          "email": "condominio.torre.oeiras.pt@mail.pt",
          "primary": true
        },
        {
          "id": "ctnulkg",
          "name": "André Silva",
          "role": "Gerente",
          "phone": "938729106",
          "email": "",
          "primary": false
        }
      ],
      "type": "company"
    },
    {
      "id": "cq1kqe",
      "no": "CUST26000041",
      "name": "Sara Fernandes",
      "nif": "237838306",
      "phone": "966 143 653",
      "email": "sara.fernandes@gmail.com",
      "billing": {
        "line1": "Av. Jorge V 15",
        "line2": "",
        "country": "Portugal",
        "city": "Carcavelos",
        "postal": "2775-568"
      },
      "locations": [
        {
          "id": "locmc0h5",
          "name": "Casa — Carcavelos",
          "address": {
            "line1": "Av. Jorge V 15",
            "line2": "",
            "country": "Portugal",
            "city": "Carcavelos",
            "postal": "2775-568"
          },
          "notes": ""
        }
      ],
      "notes": "",
      "dims": {},
      "contacts": [
        {
          "id": "ctwysax",
          "self": true,
          "name": "Sara Fernandes",
          "role": "",
          "phone": "966 143 653",
          "email": "sara.fernandes@gmail.com",
          "primary": true
        }
      ],
      "type": "person"
    },
    {
      "id": "cy1b96",
      "no": "CUST26000042",
      "name": "Filipe Santos",
      "nif": "256563048",
      "phone": "923 734 419",
      "email": "filipe.santos@gmail.com",
      "billing": {
        "line1": "Rua do Alecrim 52",
        "line2": "",
        "country": "Portugal",
        "city": "Lisboa",
        "postal": "1200-018"
      },
      "locations": [
        {
          "id": "locamqa4",
          "name": "Casa — Lisboa",
          "address": {
            "line1": "Rua do Alecrim 52",
            "line2": "",
            "country": "Portugal",
            "city": "Lisboa",
            "postal": "1200-018"
          },
          "notes": ""
        }
      ],
      "notes": "",
      "dims": {},
      "contacts": [
        {
          "id": "ct9b367",
          "self": true,
          "name": "Filipe Santos",
          "role": "",
          "phone": "923 734 419",
          "email": "filipe.santos@gmail.com",
          "primary": true
        }
      ],
      "type": "person"
    },
    {
      "id": "c6tnpx",
      "no": "CUST26000043",
      "name": "Filipe Carvalho",
      "nif": "223760926",
      "phone": "910 267 511",
      "email": "filipe.carvalho@gmail.com",
      "billing": {
        "line1": "Rua Augusta 153",
        "line2": "",
        "country": "Portugal",
        "city": "Lisboa",
        "postal": "1100-053"
      },
      "locations": [
        {
          "id": "locn4ixh",
          "name": "Casa — Lisboa",
          "address": {
            "line1": "Rua Augusta 153",
            "line2": "",
            "country": "Portugal",
            "city": "Lisboa",
            "postal": "1100-053"
          },
          "notes": ""
        }
      ],
      "notes": "",
      "dims": {},
      "contacts": [
        {
          "id": "ctt4cro",
          "self": true,
          "name": "Filipe Carvalho",
          "role": "",
          "phone": "910 267 511",
          "email": "filipe.carvalho@gmail.com",
          "primary": true
        }
      ],
      "type": "person"
    },
    {
      "id": "cv3r64",
      "no": "CUST26000044",
      "name": "Agência Viagens Horizonte",
      "nif": "553287046",
      "phone": "210 141 561",
      "email": "agencia.viagens.horizonte.pt@mail.pt",
      "billing": {
        "line1": "Av. Jorge V 114",
        "line2": "",
        "country": "Portugal",
        "city": "Carcavelos",
        "postal": "2775-568"
      },
      "locations": [
        {
          "id": "locg51bz",
          "name": "Loja — Carcavelos",
          "address": {
            "line1": "Av. Jorge V 114",
            "line2": "",
            "country": "Portugal",
            "city": "Carcavelos",
            "postal": "2775-568"
          },
          "notes": ""
        }
      ],
      "notes": "",
      "dims": {},
      "contacts": [
        {
          "id": "ctuugf9",
          "self": true,
          "name": "Agência Viagens Horizonte",
          "role": "",
          "phone": "210 141 561",
          "email": "agencia.viagens.horizonte.pt@mail.pt",
          "primary": true
        },
        {
          "id": "ctj0dzt",
          "name": "Helena Rodrigues",
          "role": "Responsável de manutenção",
          "phone": "936179113",
          "email": "",
          "primary": false
        }
      ],
      "type": "company"
    },
    {
      "id": "ckptpr",
      "no": "CUST26000045",
      "name": "Ricardo Ferreira",
      "nif": "207358735",
      "phone": "960 607 104",
      "email": "ricardo.ferreira@gmail.com",
      "billing": {
        "line1": "Rua do Alecrim 8",
        "line2": "",
        "country": "Portugal",
        "city": "Lisboa",
        "postal": "1200-018"
      },
      "locations": [
        {
          "id": "locsrr9y",
          "name": "Casa — Lisboa",
          "address": {
            "line1": "Rua do Alecrim 8",
            "line2": "",
            "country": "Portugal",
            "city": "Lisboa",
            "postal": "1200-018"
          },
          "notes": ""
        },
        {
          "id": "locazyj7",
          "name": "Apartamento — Oeiras",
          "address": {
            "line1": "Rua Mouzinho de Albuquerque 197",
            "line2": "",
            "country": "Portugal",
            "city": "Oeiras",
            "postal": "2780-245"
          },
          "notes": ""
        }
      ],
      "notes": "",
      "dims": {},
      "contacts": [
        {
          "id": "ctoe34y",
          "self": true,
          "name": "Ricardo Ferreira",
          "role": "",
          "phone": "960 607 104",
          "email": "ricardo.ferreira@gmail.com",
          "primary": true
        }
      ],
      "type": "person"
    },
    {
      "id": "cf7vlc",
      "no": "CUST26000046",
      "name": "Inês Mendes",
      "nif": "219554590",
      "phone": "919 103 177",
      "email": "ines.mendes@gmail.com",
      "billing": {
        "line1": "Rua de Campo de Ourique 237",
        "line2": "",
        "country": "Portugal",
        "city": "Lisboa",
        "postal": "1250-061"
      },
      "locations": [
        {
          "id": "locoynf2",
          "name": "Casa — Lisboa",
          "address": {
            "line1": "Rua de Campo de Ourique 237",
            "line2": "",
            "country": "Portugal",
            "city": "Lisboa",
            "postal": "1250-061"
          },
          "notes": ""
        }
      ],
      "notes": "",
      "dims": {},
      "contacts": [
        {
          "id": "ctkva4f",
          "self": true,
          "name": "Inês Mendes",
          "role": "",
          "phone": "919 103 177",
          "email": "ines.mendes@gmail.com",
          "primary": true
        }
      ],
      "type": "person"
    },
    {
      "id": "czrz4n",
      "no": "CUST26000047",
      "name": "Lavandaria Bolha",
      "nif": "946727204",
      "phone": "215 759 183",
      "email": "lavandaria.bolha.pt@mail.pt",
      "billing": {
        "line1": "Rua Dr. Manuel Arriaga 156",
        "line2": "",
        "country": "Portugal",
        "city": "Carcavelos",
        "postal": "2775-579"
      },
      "locations": [
        {
          "id": "loc7dh2q",
          "name": "Loja — Carcavelos",
          "address": {
            "line1": "Rua Dr. Manuel Arriaga 156",
            "line2": "",
            "country": "Portugal",
            "city": "Carcavelos",
            "postal": "2775-579"
          },
          "notes": ""
        }
      ],
      "notes": "",
      "dims": {},
      "contacts": [
        {
          "id": "ctr2o1p",
          "self": true,
          "name": "Lavandaria Bolha",
          "role": "",
          "phone": "215 759 183",
          "email": "lavandaria.bolha.pt@mail.pt",
          "primary": true
        },
        {
          "id": "ct5vove",
          "name": "Tiago Martins",
          "role": "Responsável de manutenção",
          "phone": "911568138",
          "email": "",
          "primary": false
        }
      ],
      "type": "company"
    },
    {
      "id": "c76hit",
      "no": "CUST26000048",
      "name": "Filipe Ribeiro",
      "nif": "285261149",
      "phone": "962 326 793",
      "email": "filipe.ribeiro@gmail.com",
      "billing": {
        "line1": "Av. de Roma 108",
        "line2": "",
        "country": "Portugal",
        "city": "Lisboa",
        "postal": "1000-264"
      },
      "locations": [
        {
          "id": "loczv4j1",
          "name": "Casa — Lisboa",
          "address": {
            "line1": "Av. de Roma 108",
            "line2": "",
            "country": "Portugal",
            "city": "Lisboa",
            "postal": "1000-264"
          },
          "notes": ""
        }
      ],
      "notes": "",
      "dims": {},
      "contacts": [
        {
          "id": "cts81ed",
          "self": true,
          "name": "Filipe Ribeiro",
          "role": "",
          "phone": "962 326 793",
          "email": "filipe.ribeiro@gmail.com",
          "primary": true
        }
      ],
      "type": "person"
    },
    {
      "id": "cqi4vs",
      "no": "CUST26000049",
      "name": "Cabeleireiro Estilo",
      "nif": "544494544",
      "phone": "212 493 516",
      "email": "cabeleireiro.estilo.pt@mail.pt",
      "billing": {
        "line1": "Av. Almirante Reis 48",
        "line2": "",
        "country": "Portugal",
        "city": "Lisboa",
        "postal": "1150-018"
      },
      "locations": [
        {
          "id": "loct52x0",
          "name": "Loja — Lisboa",
          "address": {
            "line1": "Av. Almirante Reis 48",
            "line2": "",
            "country": "Portugal",
            "city": "Lisboa",
            "postal": "1150-018"
          },
          "notes": ""
        }
      ],
      "notes": "",
      "dims": {},
      "contacts": [
        {
          "id": "ctb97zj",
          "self": true,
          "name": "Cabeleireiro Estilo",
          "role": "",
          "phone": "212 493 516",
          "email": "cabeleireiro.estilo.pt@mail.pt",
          "primary": true
        },
        {
          "id": "ct1gxpp",
          "name": "Miguel Almeida",
          "role": "Administração",
          "phone": "922686822",
          "email": "",
          "primary": false
        }
      ],
      "type": "company"
    },
    {
      "id": "chr4dg",
      "no": "CUST26000050",
      "name": "Sofia Marques",
      "nif": "201073750",
      "phone": "921 582 794",
      "email": "sofia.marques@gmail.com",
      "billing": {
        "line1": "Av. da República 31",
        "line2": "",
        "country": "Portugal",
        "city": "Parede",
        "postal": "2775-274"
      },
      "locations": [
        {
          "id": "locl3yet",
          "name": "Casa — Parede",
          "address": {
            "line1": "Av. da República 31",
            "line2": "",
            "country": "Portugal",
            "city": "Parede",
            "postal": "2775-274"
          },
          "notes": ""
        }
      ],
      "notes": "",
      "dims": {},
      "contacts": [
        {
          "id": "ctm7c5w",
          "self": true,
          "name": "Sofia Marques",
          "role": "",
          "phone": "921 582 794",
          "email": "sofia.marques@gmail.com",
          "primary": true
        }
      ],
      "type": "person"
    }
  ],
  "vendors": [
    {
      "id": "vmliem",
      "no": "VEND26000001",
      "off": [],
      "name": "Manuel Ferreira",
      "type": "person",
      "phone": "912 345 101",
      "nif": "213456781",
      "rate": 140,
      "unit": "day",
      "address": {
        "line1": "Rua Elias Garcia 45",
        "line2": "",
        "country": "Portugal",
        "city": "Amadora",
        "postal": "2700-327"
      },
      "dims": {
        "ESPECIALIDADE": ["ALVENARIA", "LADRILHOS"],
        "VIATURA": ["SIM"]
      }
    },
    {
      "id": "vbme41",
      "no": "VEND26000002",
      "off": [],
      "name": "Rui Santos",
      "type": "person",
      "phone": "913 222 404",
      "nif": "214567892",
      "rate": 160,
      "unit": "day",
      "address": {
        "line1": "Rua Cândido dos Reis 12",
        "line2": "",
        "country": "Portugal",
        "city": "Oeiras",
        "postal": "2780-213"
      },
      "dims": {
        "ESPECIALIDADE": ["ELETRICIDADE", "AVAC"],
        "VIATURA": ["SIM"]
      }
    },
    {
      "id": "vz47fv",
      "no": "VEND26000003",
      "off": [],
      "name": "Carlos Pinto",
      "type": "person",
      "phone": "916 777 212",
      "nif": "215678903",
      "rate": 150,
      "unit": "day",
      "address": {
        "line1": "Rua de Campolide 88",
        "line2": "",
        "country": "Portugal",
        "city": "Lisboa",
        "postal": "1070-030"
      },
      "dims": {
        "ESPECIALIDADE": ["CANALIZACAO"],
        "VIATURA": ["SIM"]
      }
    },
    {
      "id": "vj2omj",
      "no": "VEND26000004",
      "off": [],
      "name": "João Almeida",
      "type": "person",
      "phone": "917 888 330",
      "nif": "216789014",
      "rate": 120,
      "unit": "day",
      "address": {
        "line1": "Rua Guilherme Gomes Fernandes 3",
        "line2": "",
        "country": "Portugal",
        "city": "Odivelas",
        "postal": "2675-372"
      },
      "dims": {
        "ESPECIALIDADE": ["PINTURA", "PLADUR"],
        "VIATURA": ["NAO"]
      }
    },
    {
      "id": "v9c9ay",
      "no": "VEND26000005",
      "off": [],
      "name": "Paulo Costa",
      "type": "person",
      "phone": "918 111 550",
      "nif": "217890125",
      "rate": 135,
      "unit": "day",
      "address": {
        "line1": "Rua Frederico Arouca 101",
        "line2": "",
        "country": "Portugal",
        "city": "Cascais",
        "postal": "2750-355"
      },
      "dims": {
        "ESPECIALIDADE": ["CARPINTARIA", "MANUTENCAO"],
        "VIATURA": ["SIM"]
      }
    },
    {
      "id": "vdwb2f",
      "no": "VEND26000006",
      "off": [],
      "name": "Telhados Atlântico, Lda",
      "type": "company",
      "phone": "219 230 450",
      "nif": "509876541",
      "rate": null,
      "unit": "job",
      "address": {
        "line1": "Estrada de Chão de Meninos 5",
        "line2": "",
        "country": "Portugal",
        "city": "Sintra",
        "postal": "2710-121"
      },
      "dims": {
        "ESPECIALIDADE": ["TELHADOS", "IMPERMEABILIZACAO"],
        "VIATURA": ["SIM"]
      }
    },
    {
      "id": "vpa1yc",
      "no": "VEND26000007",
      "off": [],
      "name": "Frio & Clima, Lda",
      "type": "company",
      "phone": "212 740 880",
      "nif": "510987652",
      "rate": 180,
      "unit": "day",
      "address": {
        "line1": "Rua Capitão Leitão 20",
        "line2": "",
        "country": "Portugal",
        "city": "Almada",
        "postal": "2800-133"
      },
      "dims": {
        "ESPECIALIDADE": ["AVAC", "ELETRICIDADE"],
        "VIATURA": ["SIM"]
      }
    },
    {
      "id": "vfut8h",
      "no": "VEND26000008",
      "off": [],
      "name": "Serralharia Moderna, Lda",
      "type": "company",
      "phone": "212 210 660",
      "nif": "511098763",
      "rate": null,
      "unit": "job",
      "address": {
        "line1": "Rua da Indústria 7",
        "line2": "",
        "country": "Portugal",
        "city": "Seixal",
        "postal": "2840-401"
      },
      "dims": {
        "ESPECIALIDADE": ["SERRALHARIA"],
        "VIATURA": ["SIM"]
      }
    },
    {
      "id": "vcvxza",
      "no": "VEND26000009",
      "off": [],
      "name": "Gesso & Pladur Lisboa, Lda",
      "type": "company",
      "phone": "218 450 220",
      "nif": "512109874",
      "rate": 130,
      "unit": "day",
      "address": {
        "line1": "Av. Marechal Gomes da Costa 33",
        "line2": "",
        "country": "Portugal",
        "city": "Lisboa",
        "postal": "1800-255"
      },
      "dims": {
        "ESPECIALIDADE": ["PLADUR", "PINTURA"],
        "VIATURA": ["SIM"]
      }
    },
    {
      "id": "v8jmqa",
      "no": "VEND26000010",
      "off": [],
      "name": "Multiobras Manutenção, Lda",
      "type": "company",
      "phone": "219 830 990",
      "nif": "513210985",
      "rate": 125,
      "unit": "day",
      "address": {
        "line1": "Rua da República 60",
        "line2": "",
        "country": "Portugal",
        "city": "Loures",
        "postal": "2670-473"
      },
      "dims": {
        "ESPECIALIDADE": ["MANUTENCAO", "CANALIZACAO", "ELETRICIDADE"],
        "VIATURA": ["SIM"]
      }
    }
  ],
  "resources": [
    {
      "id": "rhz1ky",
      "no": "RES26000001",
      "name": "Parafusos para madeira (caixa 200)",
      "unit": "unit",
      "hist": [
        ["2026-10-21", 6.5]
      ]
    },
    {
      "id": "rwcvdc",
      "no": "RES26000002",
      "name": "Buchas e parafusos (kit)",
      "unit": "unit",
      "hist": [
        ["2026-10-21", 4.9]
      ]
    },
    {
      "id": "rrt9cu",
      "no": "RES26000003",
      "name": "Martelo de unha",
      "unit": "unit",
      "hist": [
        ["2026-10-21", 14.9]
      ]
    },
    {
      "id": "rc8i4s",
      "no": "RES26000004",
      "name": "Lâmpada LED E27 9 W",
      "unit": "unit",
      "hist": [
        ["2026-10-21", 2.8]
      ]
    },
    {
      "id": "rgjb55",
      "no": "RES26000005",
      "name": "Lâmpada LED tubular T8 120 cm",
      "unit": "unit",
      "hist": [
        ["2026-10-21", 6.4]
      ]
    },
    {
      "id": "rh6ssd",
      "no": "RES26000006",
      "name": "Tinta plástica branca 15 L",
      "unit": "can",
      "hist": [
        ["2026-10-21", 54]
      ]
    },
    {
      "id": "rsoqbx",
      "no": "RES26000007",
      "name": "Cimento-cola 25 kg",
      "unit": "bag",
      "hist": [
        ["2026-10-21", 9.5]
      ]
    },
    {
      "id": "rdogk7",
      "no": "RES26000008",
      "name": "Cimento Portland 25 kg",
      "unit": "bag",
      "hist": [
        ["2026-10-21", 5.2]
      ]
    },
    {
      "id": "rqilcr",
      "no": "RES26000009",
      "name": "Areia lavada",
      "unit": "m³",
      "hist": [
        ["2026-10-21", 38]
      ]
    },
    {
      "id": "r98nnr",
      "no": "RES26000010",
      "name": "Silicone sanitário",
      "unit": "unit",
      "hist": [
        ["2026-10-21", 6.2]
      ]
    },
    {
      "id": "rw7s13",
      "no": "RES26000011",
      "name": "Cabo elétrico 3×2,5 mm²",
      "unit": "m",
      "hist": [
        ["2026-10-21", 1.35]
      ]
    },
    {
      "id": "rr2kqn",
      "no": "RES26000012",
      "name": "Tubo multicamada 16 mm",
      "unit": "m",
      "hist": [
        ["2026-10-21", 2.1]
      ]
    },
    {
      "id": "r7agz2",
      "no": "RES26000013",
      "name": "Gasolina",
      "unit": "L",
      "hist": []
    },
    {
      "id": "r3ykd6",
      "no": "RES26000014",
      "name": "Gasóleo",
      "unit": "L",
      "hist": []
    },
    {
      "id": "r7xzmu",
      "no": "RES26000015",
      "name": "Portagens",
      "unit": "unit",
      "hist": []
    }
  ],
  "quotes": [],
  "outbox": [],
  "files": [],
  "routes": []
};
