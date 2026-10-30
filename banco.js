/* =========================================================
   Banco de ítems — Diagnóstico empresarial (versión 4)
   Ajustado según la malla receptora del equipo de trabajo.

   Cada ítem describe UNA práctica y se califica con la escala de madurez:
   1 No existe · 2 Informal · 3 Definido · 4 Implementado · 5 Mejorado

   Campos de cada ítem:
     id    código estable (no cambiarlo: es la llave en la base de datos)
     t     texto de la práctica
     help  glosa o apoyo de comprensión (opcional)
     cond  filtro de aplicabilidad según el perfil (opcional). Varios
           filtros separados por "|" significan "aplica si cumple alguno".
     crit  true = práctica crítica: si se califica 1 o 2 genera alerta roja
     opt   true = práctica opcional: permite responder "No aplica"
   Filtros disponibles (se definen en PERFIL):
     inv, eq, cf, cred, deuda, dig, ads, exp, imp, intl, cont,
     emp (tiene trabajadores directos), com, serv, man (actividad principal)
   ========================================================= */
window.DIAG_BANCO = {
version: "v4",

SCALE: [
 {v:1, name:"No existe",    desc:"La práctica no se realiza en la empresa."},
 {v:2, name:"Informal",     desc:"Se hace a veces o depende de una persona; no hay nada escrito ni registros."},
 {v:3, name:"Definido",     desc:"Está definida o escrita, pero se aplica de forma irregular."},
 {v:4, name:"Implementado", desc:"Se aplica de forma regular y deja evidencia (registros, informes, documentos)."},
 {v:5, name:"Mejorado",     desc:"Además de aplicarse, se mide y se ajusta con base en los resultados."}
],

ACTIVIDADES: [
 {k:"com",  name:"Comercio (compra y venta de productos)"},
 {k:"serv", name:"Servicios"},
 {k:"man",  name:"Manufactura o producción"}
],

PERFIL: [
 {k:"inv",   q:"¿La empresa maneja inventarios?", help:"Mercancía para la venta, materias primas o insumos que se almacenan."},
 {k:"eq",    q:"¿La empresa usa equipos, maquinaria o vehículos propios en su operación?"},
 {k:"cf",    q:"¿La empresa vende a consumidor final?", help:"Personas naturales que compran para su propio uso, no para revender."},
 {k:"cred",  q:"¿La empresa vende a crédito?", help:"Da a sus clientes un plazo para pagar las facturas."},
 {k:"deuda", q:"¿La empresa tiene créditos u obligaciones financieras vigentes?"},
 {k:"cont",  q:"¿La empresa trabaja con contratistas (contratos de prestación de servicios)?"},
 {k:"dig",   q:"¿Los canales digitales son relevantes para atraer o atender a sus clientes?", help:"Redes sociales, página web, WhatsApp, tiendas en línea. Responda «No» si, por su modelo de negocio, sus clientes no llegan por estos canales; por ejemplo, algunas empresas que venden a otras empresas o atienden un nicho muy específico."},
 {k:"ads",   q:"¿La empresa invierte en publicidad pagada en internet?", help:"Anuncios en redes sociales (Meta, TikTok) o en buscadores (Google)."},
 {k:"exp",   q:"¿La empresa exporta actualmente?"},
 {k:"imp",   q:"¿La empresa importa actualmente?"},
 {k:"intl",  q:"¿La empresa tiene interés en exportar o importar en los próximos dos años?"}
],

AREAS: [
/* ---------------------------------------------------------------- */
{id:"fin", name:"Financiera", subs:[
 {name:"Información financiera",
  rec:"Pedir al contador estados financieros al menos cada trimestre, construir un presupuesto anual y revisarlo cada mes frente a lo real. Abrir cuentas bancarias exclusivas de la empresa y asignar al propietario un salario fijo en lugar de retirar dinero según la necesidad.",
  items:[
  {id:"F01", t:"La empresa elabora estados financieros (estado de resultados y balance general) al menos cada trimestre.",
   help:"Estado de resultados: muestra los ingresos, costos, gastos y la utilidad o pérdida de un periodo. Balance general: muestra lo que la empresa tiene (activos), lo que debe (pasivos) y lo que pertenece a los dueños (patrimonio). Evidencia: informes del contador con fecha."},
  {id:"F02", t:"La empresa compara cada mes sus resultados reales con un presupuesto anual.",
   help:"Presupuesto: estimación, hecha al inicio del año, de los ingresos y gastos esperados mes a mes. Evidencia: archivo con columnas de presupuestado y real."},
  {id:"F03", t:"Las finanzas del negocio están separadas de las finanzas personales del propietario.", crit:true,
   help:"Significa que la empresa tiene cuentas bancarias propias y que no se pagan gastos personales con dinero del negocio (ni al revés). Si el dueño necesita dinero, se lo asigna como salario o como retiro registrado."}
 ]},
 {name:"Liquidez",
  rec:"Elaborar un flujo de caja proyectado a 13 semanas y actualizarlo cada semana. Calcular cada mes la razón corriente, la prueba ácida y el capital de trabajo, y definir un saldo mínimo de efectivo.",
  items:[
  {id:"F04", t:"La empresa calcula su razón corriente al menos cada trimestre.",
   help:"Razón corriente = activo corriente ÷ pasivo corriente. Indica con cuántos pesos de corto plazo cuenta la empresa por cada peso que debe a corto plazo. Ejemplo: 1,5 significa $1,50 disponibles por cada $1 de deuda de corto plazo."},
  {id:"F05", t:"La empresa calcula su prueba ácida al menos cada trimestre.", cond:"inv",
   help:"Prueba ácida = (activo corriente − inventarios) ÷ pasivo corriente. Es como la razón corriente, pero sin contar el inventario, porque no siempre se puede vender rápido."},
  {id:"F06", t:"La empresa calcula cada mes su capital de trabajo.",
   help:"Capital de trabajo = activo corriente − pasivo corriente. Es el dinero con el que la empresa opera el día a día (comprar, pagar nómina, pagar proveedores)."},
  {id:"F07", t:"La empresa elabora un flujo de caja proyectado para al menos los próximos tres meses.", crit:true,
   help:"Flujo de caja proyectado: estimación, semana a semana o mes a mes, de las entradas y salidas de dinero. Sirve para anticipar cuándo faltará efectivo."}
 ]},
 {name:"Rentabilidad",
  rec:"Calcular cada mes los márgenes bruto, operativo y neto, determinar el punto de equilibrio y analizar la rentabilidad por producto o servicio. Revisar al menos una vez al año el ROA y el ROE.",
  items:[
  {id:"F08", t:"La empresa calcula cada mes sus márgenes de rentabilidad.",
   help:"Margen bruto = (ventas − costo de ventas) ÷ ventas. Margen neto = utilidad neta ÷ ventas. Indican qué porcentaje de cada venta queda como ganancia."},
  {id:"F09", t:"La empresa conoce su punto de equilibrio.",
   help:"Punto de equilibrio: nivel de ventas en el que los ingresos cubren exactamente todos los costos y gastos, sin ganar ni perder. Ejemplo: «necesitamos vender $30 millones al mes para no perder dinero»."},
  {id:"F10", t:"La empresa conoce la rentabilidad de cada producto o servicio que ofrece."},
  {id:"F11", t:"La empresa calcula su ROA al menos una vez al año.",
   help:"ROA (rentabilidad sobre activos) = utilidad neta ÷ activos totales. Mide cuánta ganancia generan los recursos que tiene la empresa."},
  {id:"F12", t:"La empresa calcula su ROE al menos una vez al año.",
   help:"ROE (rentabilidad sobre patrimonio) = utilidad neta ÷ patrimonio. Mide cuánto ganan los dueños por el dinero que tienen invertido en la empresa."}
 ]},
 {name:"Endeudamiento",
  rec:"Mantener un registro de deudas (acreedor, saldo, tasa y plazo), llevar un calendario de pagos y calcular la capacidad de pago antes de solicitar nuevos créditos, comparando opciones como las líneas de Bancóldex o el Fondo Nacional de Garantías.",
  items:[
  {id:"F13", t:"La empresa mantiene actualizado un registro de sus deudas (acreedor, saldo, tasa de interés y plazo).", cond:"deuda"},
  {id:"F14", t:"La empresa controla con un calendario las fechas de pago de sus obligaciones financieras.", cond:"deuda", crit:true},
  {id:"F15", t:"La empresa calcula su capacidad de pago antes de solicitar un nuevo crédito.",
   help:"Capacidad de pago: cuánto puede pagar la empresa cada mes por cuotas sin quedarse sin efectivo para operar."}
 ]},
 {name:"Gestión del efectivo y la cartera",
  rec:"Definir por escrito una política de crédito (plazos y cupos por cliente), revisar cada semana la cartera vencida y calcular el ciclo de conversión de efectivo para negociar mejores plazos con clientes y proveedores.",
  items:[
  {id:"F16", t:"La empresa tiene una política escrita de crédito a clientes (plazos máximos y cupos).", cond:"cred"},
  {id:"F17", t:"La empresa revisa cada semana las facturas vencidas de sus clientes.", cond:"cred",
   help:"Factura vencida: la que ya pasó la fecha de pago acordada y no se ha cobrado."},
  {id:"F18", t:"La empresa calcula su ciclo de conversión de efectivo.",
   help:"Ciclo de conversión de efectivo = días de inventario + días de cobro a clientes − días de pago a proveedores. Indica cuántos días pasan entre el momento en que la empresa paga y el momento en que recupera ese dinero. Entre más corto, mejor."}
 ]}
]},

/* ---------------------------------------------------------------- */
{id:"mkt", name:"Marketing", subs:[
 {name:"Segmento de clientes y propuesta de valor",
  rec:"Describir por escrito el perfil del cliente ideal y la propuesta de valor, y validarlos con entrevistas a clientes actuales.",
  items:[
  {id:"M01", t:"La empresa tiene descrito por escrito el perfil de su cliente ideal.",
   help:"Quién es, qué necesita, dónde está, cuánto compra y por qué elige a la empresa."},
  {id:"M02", t:"La empresa tiene definida por escrito su propuesta de valor.",
   help:"Propuesta de valor: la razón principal por la que un cliente elige a la empresa frente a la competencia (precio, calidad, rapidez, atención, especialización…)."}
 ]},
 {name:"Producto o servicio",
  rec:"Formalizar el portafolio en un catálogo y revisar cada año las ventas y el margen de cada producto o servicio para decidir cuáles mantener, mejorar o retirar.",
  items:[
  {id:"M03", t:"La empresa tiene su portafolio de productos o servicios descrito en un catálogo o lista con sus características."},
  {id:"M04", t:"La empresa revisa al menos una vez al año las ventas de cada producto o servicio para decidir cuáles mantener, mejorar o retirar."}
 ]},
 {name:"Precio",
  rec:"Fijar precios a partir del costo y del margen deseado, y compararlos cada seis meses con los de la competencia.",
  items:[
  {id:"M05", t:"La empresa fija sus precios a partir de sus costos."},
  {id:"M06", t:"La empresa compara sus precios con los de la competencia al menos cada seis meses."}
 ]},
 {name:"Plaza (canales de venta y distribución)",
  rec:"Medir las ventas por canal (tienda, vendedores, distribuidores, internet) y revisar cada año cuáles son más rentables para concentrar el esfuerzo en ellos.",
  items:[
  {id:"M07", t:"La empresa mide las ventas de cada uno de sus canales de venta.",
   help:"Canales de venta: las vías por las que llega el producto o servicio al cliente; por ejemplo, punto de venta propio, vendedores, distribuidores, tiendas en línea o WhatsApp."},
  {id:"M08", t:"La empresa revisa al menos una vez al año qué canales de venta son más rentables."}
 ]},
 {name:"Promoción",
  rec:"Asignar un presupuesto anual de mercadeo, planear los contenidos digitales con un calendario y medir sus resultados. Si hay pauta pagada, calcular el ROAS de cada campaña.",
  items:[
  {id:"M09", t:"La empresa tiene un presupuesto anual de mercadeo.",
   help:"Dinero asignado con anticipación para publicidad, material promocional, eventos o redes sociales."},
  {id:"M10", t:"La empresa publica contenido en sus canales digitales siguiendo un calendario.", cond:"dig"},
  {id:"M11", t:"La empresa mide los resultados de sus canales digitales (alcance, mensajes recibidos, ventas generadas).", cond:"dig"},
  {id:"M12", t:"La empresa mide el ROAS de su publicidad pagada en internet.", cond:"ads",
   help:"ROAS (retorno de la inversión publicitaria) = ingresos generados por los anuncios ÷ dinero invertido en los anuncios. Ejemplo: un ROAS de 4 significa $4 en ventas por cada $1 invertido. Solo aplica si la empresa paga anuncios."}
 ]},
 {name:"Fuerza de ventas",
  rec:"Registrar los prospectos en una base de datos o CRM sencillo, hacer seguimiento a cada cotización y medir la tasa de cierre. Evaluar herramientas de automatización cuando el volumen de clientes lo justifique.",
  items:[
  {id:"M13", t:"La empresa registra sus clientes potenciales (prospectos) en una base de datos o CRM.",
   help:"CRM: herramienta (puede ser una hoja de cálculo o un programa) para registrar clientes, contactos, cotizaciones y seguimientos."},
  {id:"M14", t:"La empresa hace seguimiento a cada cotización enviada hasta saber si se cerró la venta."},
  {id:"M15", t:"La empresa mide su tasa de cierre de ventas.",
   help:"Tasa de cierre = cotizaciones que se convierten en venta ÷ total de cotizaciones enviadas."},
  {id:"M16", t:"La empresa usa herramientas de automatización o de inteligencia artificial en su gestión comercial.", opt:true,
   help:"Por ejemplo: respuestas automáticas, campañas programadas o análisis automático de clientes. No es obligatorio para todas las empresas: si no es pertinente para su modelo de negocio, marque «No aplica»."}
 ]},
 {name:"Posventa y fidelización",
  rec:"Medir la satisfacción de los clientes al menos cada seis meses (por ejemplo, con una encuesta corta tipo NPS), contactar a los clientes después de la venta y definir beneficios para los clientes recurrentes.",
  items:[
  {id:"M17", t:"La empresa mide la satisfacción de sus clientes al menos cada seis meses.",
   help:"Por ejemplo, con una encuesta corta. Una medida común es el NPS: «de 0 a 10, ¿qué tan probable es que nos recomiende?»."},
  {id:"M18", t:"La empresa contacta a sus clientes después de la venta para hacer seguimiento."},
  {id:"M19", t:"La empresa tiene acciones definidas para fidelizar a sus clientes recurrentes.",
   help:"Por ejemplo: descuentos por recompra, programa de puntos, atención preferencial o comunicación personalizada."}
 ]}
]},

/* ---------------------------------------------------------------- */
{id:"ops", name:"Operaciones y calidad", short:"Operaciones", subs:[
 {name:"Gestión de procesos",
  rec:"Identificar los procesos clave, documentarlos en procedimientos sencillos, asignar un responsable a cada uno y definir indicadores que se revisen cada mes.",
  items:[
  {id:"O01", t:"Los procesos clave de la empresa están documentados en procedimientos o instructivos escritos.",
   help:"Procesos clave: las actividades centrales para entregar el producto o servicio; por ejemplo, recibir el pedido, comprar, producir o prestar el servicio, entregar y facturar."},
  {id:"O02", t:"Cada proceso clave tiene un responsable asignado por escrito.",
   help:"Se refiere a la persona que responde por el funcionamiento del proceso, no al cargo o al manual de funciones (eso se evalúa en Gestión humana)."},
  {id:"O03", t:"Los procesos clave tienen indicadores que se revisan cada mes.",
   help:"Indicador: dato que permite saber si el proceso funciona bien. Ejemplos: pedidos atendidos por día, tiempo promedio de atención, porcentaje de errores."}
 ]},
 {name:"Capacidad y productividad",
  rec:"Medir la capacidad de atención o producción, registrar las fallas (errores, reprocesos, desperdicios) y analizar sus causas cada trimestre. Si hay equipos, establecer un plan de mantenimiento preventivo.",
  items:[
  {id:"O04", t:"La empresa conoce cuántos pedidos, servicios o unidades puede atender en un periodo (su capacidad).",
   help:"Ejemplo: «podemos atender 40 citas por semana» o «producimos 2.000 unidades al mes»."},
  {id:"O05", t:"La empresa registra las fallas de su operación (errores, reprocesos o desperdicios)."},
  {id:"O06", t:"La empresa analiza al menos cada trimestre las causas de las fallas registradas."},
  {id:"O07", t:"La empresa tiene un plan de mantenimiento preventivo para sus equipos, maquinaria o vehículos.", cond:"eq",
   help:"Mantenimiento preventivo: revisiones programadas antes de que el equipo se dañe, con fechas y registro."}
 ]},
 {name:"Inventarios y abastecimiento",
  rec:"Registrar entradas y salidas de inventario, definir mínimos y máximos para los productos principales y hacer conteos físicos periódicos. Evaluar a los proveedores cada año e identificar alternativas para los insumos críticos.",
  items:[
  {id:"O08", t:"La empresa registra las entradas y salidas de inventario en un sistema o kárdex.", cond:"inv",
   help:"Kárdex: registro de cada entrada y salida de un producto, con fecha, cantidad y saldo."},
  {id:"O09", t:"La empresa define niveles mínimos y máximos de inventario para sus productos o insumos principales.", cond:"inv",
   help:"Mínimo: cantidad a partir de la cual se debe volver a pedir. Máximo: cantidad que no conviene superar para no inmovilizar dinero."},
  {id:"O10", t:"La empresa hace conteos físicos de inventario al menos cada seis meses.", cond:"inv"},
  {id:"O11", t:"La empresa evalúa al menos una vez al año el desempeño de sus proveedores principales.",
   help:"Por ejemplo, calificando calidad, cumplimiento de entregas y precio."},
  {id:"O12", t:"La empresa tiene identificados proveedores alternativos para sus insumos o servicios críticos."}
 ]},
 {name:"Gestión de calidad",
  rec:"Definir por escrito los requisitos de calidad, establecer puntos de control en las etapas clave y registrar las acciones correctivas cada vez que se detecte una falla.",
  items:[
  {id:"O13", t:"La empresa tiene definidos por escrito los requisitos de calidad de su producto o servicio."},
  {id:"O14", t:"La empresa tiene puntos de control de calidad definidos en las etapas clave de su operación."},
  {id:"O15", t:"La empresa registra las acciones correctivas que toma cuando detecta una falla de calidad.",
   help:"Acción correctiva: lo que se hace para eliminar la causa de una falla y evitar que se repita."},
  {id:"O16", t:"La empresa verifica la calidad de la mercancía al recibirla de sus proveedores.", cond:"com"},
  {id:"O17", t:"La empresa tiene protocolos escritos para la prestación de sus servicios.", cond:"serv",
   help:"Protocolo: guía paso a paso de cómo se presta el servicio, para que siempre se haga igual sin importar quién lo preste."},
  {id:"O18", t:"La empresa tiene fichas técnicas de sus productos.", cond:"man",
   help:"Ficha técnica: documento con materiales, medidas, especificaciones y proceso de fabricación de cada producto."}
 ]},
 {name:"Entrega y servicio al cliente",
  rec:"Registrar para cada pedido o servicio la fecha comprometida y la fecha real, revisar cada mes el porcentaje de cumplimiento y llevar un registro de quejas y reclamos.",
  items:[
  {id:"O19", t:"La empresa registra la fecha comprometida y la fecha real de cada entrega o servicio."},
  {id:"O20", t:"La empresa revisa cada mes el porcentaje de entregas o servicios cumplidos a tiempo."},
  {id:"O21", t:"La empresa registra las quejas y reclamos de sus clientes.",
   help:"Por ejemplo, en un libro, formulario o sistema de PQRS (peticiones, quejas, reclamos y sugerencias)."}
 ]}
]},

/* ---------------------------------------------------------------- */
{id:"gh", name:"Gestión humana", cond:"emp", subs:[
 {name:"Estructura organizacional",
  rec:"Diseñar el organigrama, escribir un perfil y un manual de funciones para cada cargo, y proyectar cada año las necesidades de personal.",
  items:[
  {id:"H01", t:"La empresa tiene un organigrama actualizado.",
   help:"Organigrama: gráfico que muestra los cargos de la empresa y quién reporta a quién."},
  {id:"H02", t:"Cada cargo tiene un perfil escrito.",
   help:"Perfil del cargo: formación, experiencia y competencias que debe tener la persona que ocupe el cargo."},
  {id:"H03", t:"Cada cargo tiene un manual de funciones escrito.",
   help:"Manual de funciones: las tareas y responsabilidades del cargo."},
  {id:"H04", t:"La empresa planea una vez al año sus necesidades de personal."}
 ]},
 {name:"Atracción, selección e inducción",
  rec:"Estandarizar la selección con criterios por cargo (aplicables también a familiares y conocidos), verificar referencias y diseñar un programa de inducción.",
  items:[
  {id:"H05", t:"La empresa aplica criterios de selección definidos para cada cargo, también cuando el candidato es familiar o conocido."},
  {id:"H06", t:"La empresa verifica las referencias laborales de los candidatos antes de contratarlos."},
  {id:"H07", t:"Cada nuevo trabajador recibe una inducción con un programa definido.",
   help:"Inducción: presentación de la empresa, el cargo, las normas y los procesos a una persona que ingresa."}
 ]},
 {name:"Capacitación y desempeño",
  rec:"Elaborar un plan anual de capacitación basado en necesidades identificadas y evaluar el desempeño al menos una vez al año, cerrando cada evaluación con un plan de mejora.",
  items:[
  {id:"H08", t:"La empresa tiene un plan anual de capacitación basado en las necesidades de formación identificadas."},
  {id:"H09", t:"La empresa evalúa el desempeño de sus trabajadores al menos una vez al año."},
  {id:"H10", t:"Cada evaluación de desempeño termina con un plan de mejora acordado con el trabajador."}
 ]},
 {name:"Clima, comunicación y bienestar",
  rec:"Medir el clima laboral una vez al año, crear espacios mensuales de comunicación entre la dirección y el equipo, y definir un programa de bienestar y mecanismos de reconocimiento.",
  items:[
  {id:"H11", t:"La empresa mide el clima laboral al menos una vez al año.",
   help:"Clima laboral: cómo perciben los trabajadores su ambiente de trabajo. Se mide con una encuesta o con entrevistas."},
  {id:"H12", t:"La dirección tiene espacios de comunicación con los trabajadores al menos una vez al mes."},
  {id:"H13", t:"La empresa tiene un programa de bienestar para sus trabajadores.",
   help:"Actividades para mejorar la calidad de vida de los trabajadores: integración, salud, recreación, apoyo familiar, etc."},
  {id:"H14", t:"La empresa tiene mecanismos definidos para reconocer el buen desempeño."}
 ]},
 {name:"Indicadores de gestión humana",
  rec:"Medir cada mes la rotación y el ausentismo, y registrar los motivos de retiro con entrevistas de salida.",
  items:[
  {id:"H15", t:"La empresa mide cada mes la rotación de personal.",
   help:"Rotación: porcentaje de trabajadores que salen de la empresa en un periodo."},
  {id:"H16", t:"La empresa mide cada mes el ausentismo.",
   help:"Ausentismo: porcentaje de horas o días de trabajo perdidos por ausencias (incapacidades, permisos, faltas)."},
  {id:"H17", t:"La empresa registra el motivo de retiro de cada trabajador que sale."}
 ]}
]},

/* ---------------------------------------------------------------- */
{id:"ce", name:"Comercio exterior", cond:"exp|imp|intl", subs:[
 {name:"Capacidad internacional",
  rec:"Identificar los productos con potencial internacional, evaluar por separado la capacidad productiva y el capital de trabajo necesarios, y formar personal bilingüe. Apoyarse en los programas de ProColombia y las cámaras de comercio.",
  items:[
  {id:"C01", t:"La empresa tiene identificados sus productos o servicios con potencial en mercados internacionales."},
  {id:"C02", t:"La empresa tiene evaluada su capacidad de producción para atender pedidos internacionales."},
  {id:"C03", t:"La empresa tiene calculado el capital de trabajo que necesitaría para operar en mercados internacionales.",
   help:"Capital de trabajo: dinero para operar el día a día. En comercio exterior suele ser mayor porque los plazos de pago y de transporte son más largos."},
  {id:"C04", t:"La empresa cuenta con personal bilingüe capacitado para negociar con clientes o proveedores extranjeros."},
  {id:"C05", t:"La empresa tiene un portafolio o brochure comercial en otro idioma.", opt:true},
  {id:"C06", t:"La empresa conoce las prácticas de negociación de los países con los que opera o quiere operar.", opt:true,
   help:"Cultura de negociación: costumbres sobre puntualidad, formalidad, tiempos de decisión y formas de cerrar acuerdos en cada país."}
 ]},
 {name:"Exportaciones", cond:"exp",
  rec:"Estudiar los requisitos de acceso de cada mercado de destino, construir un plan exportador con metas anuales y evaluar las certificaciones que exigen los clientes.",
  items:[
  {id:"C07", t:"La empresa conoce los requisitos de acceso de sus mercados de destino.",
   help:"Requisitos técnicos, sanitarios, de etiquetado o de empaque que exige cada país para dejar entrar el producto."},
  {id:"C08", t:"La empresa tiene un plan exportador con metas anuales."},
  {id:"C09", t:"La empresa cuenta con las certificaciones internacionales que exigen sus clientes o mercados.", opt:true,
   help:"Por ejemplo: ISO 9001, buenas prácticas de manufactura (BPM), certificaciones orgánicas o de comercio justo. Si su mercado no las exige, marque «No aplica»."}
 ]},
 {name:"Importaciones", cond:"imp",
  rec:"Calcular el costo total de cada importación y compararlo cada año con la oferta de proveedores nacionales.",
  items:[
  {id:"C10", t:"La empresa calcula el costo total de cada importación.",
   help:"Costo total: precio del producto + flete + seguro + aranceles + IVA + agencia de aduanas + transporte interno."},
  {id:"C11", t:"La empresa compara al menos una vez al año el costo de importar con el de comprar a proveedores nacionales."}
 ]},
 {name:"Logística internacional", cond:"exp|imp",
  rec:"Definir el Incoterm en cada negociación y trabajar con una agencia de aduanas u operador logístico evaluado.",
  items:[
  {id:"C12", t:"La empresa define el Incoterm en cada negociación internacional.",
   help:"Incoterms: reglas internacionales que definen hasta dónde responde el vendedor y desde dónde el comprador por el transporte, el seguro y los trámites. Ejemplos: EXW (el comprador recoge en la bodega del vendedor), FOB (el vendedor entrega en el puerto de origen), DDP (el vendedor entrega en la puerta del comprador con todo pagado)."},
  {id:"C13", t:"La empresa trabaja con una agencia de aduanas u operador logístico que evalúa periódicamente."}
 ]},
 {name:"Riesgos internacionales", cond:"exp|imp",
  rec:"Definir una política de cobertura del riesgo cambiario y revisar qué acuerdos comerciales benefician los productos de la empresa.",
  items:[
  {id:"C14", t:"La empresa tiene una política para gestionar el riesgo cambiario.",
   help:"Riesgo cambiario: posibilidad de ganar o perder dinero porque cambia el precio del dólar (u otra moneda) entre la negociación y el pago. Se gestiona, por ejemplo, con coberturas (forwards) o fijando precios en pesos."},
  {id:"C15", t:"La empresa revisa qué acuerdos comerciales de Colombia aplican a sus productos.",
   help:"Los acuerdos comerciales pueden reducir o eliminar aranceles si se tramita el certificado de origen."}
 ]}
]},

/* ---------------------------------------------------------------- */
{id:"leg", name:"Legal", subs:[
 {name:"Formalización",
  rec:"Crear un calendario de obligaciones (renovación de la matrícula mercantil antes del 31 de marzo, actualización del RUT, vencimientos tributarios de la DIAN y permisos) con responsable y alertas.",
  items:[
  {id:"L01", t:"La empresa renueva su matrícula mercantil cada año antes del 31 de marzo.", crit:true,
   help:"La renovación se hace ante la cámara de comercio. Hacerlo tarde genera sanciones."},
  {id:"L02", t:"El RUT de la empresa está actualizado.", crit:true,
   help:"RUT (Registro Único Tributario): registro ante la DIAN. Debe actualizarse cuando cambian la dirección, la actividad económica, los representantes, etc."},
  {id:"L03", t:"La empresa presenta sus declaraciones tributarias dentro de los plazos de la DIAN.", crit:true},
  {id:"L04", t:"La empresa tiene los permisos de funcionamiento que exige su actividad.",
   help:"Por ejemplo: concepto de uso de suelo, certificado de bomberos o concepto sanitario, según la actividad y el municipio."}
 ]},
 {name:"Laboral", cond:"emp|cont",
  rec:"Firmar contrato de trabajo escrito con cada trabajador directo, verificar una por una sus afiliaciones (EPS, pensión, ARL y caja de compensación) y programar en el calendario el pago de prima y cesantías. Usar contratos de prestación de servicios solo cuando no haya subordinación.",
  items:[
  {id:"L05", t:"Cada trabajador directo tiene contrato de trabajo escrito.", cond:"emp", crit:true,
   help:"Trabajador directo: persona vinculada con contrato laboral (cumple horario, recibe órdenes y un salario). Es distinto de un contratista, que presta un servicio con autonomía mediante un contrato de prestación de servicios."},
  {id:"L06", t:"Cada trabajador directo está afiliado a salud (EPS).", cond:"emp", crit:true},
  {id:"L07", t:"Cada trabajador directo está afiliado a un fondo de pensiones.", cond:"emp", crit:true},
  {id:"L08", t:"Cada trabajador directo está afiliado a una administradora de riesgos laborales (ARL).", cond:"emp", crit:true},
  {id:"L09", t:"Cada trabajador directo está afiliado a una caja de compensación familiar.", cond:"emp", crit:true},
  {id:"L10", t:"La empresa paga la prima de servicios en junio y en diciembre.", cond:"emp", crit:true},
  {id:"L11", t:"La empresa consigna las cesantías de cada trabajador antes del 14 de febrero.", cond:"emp", crit:true,
   help:"Las cesantías se consignan en el fondo de cesantías del trabajador. Los intereses sobre cesantías (12 % anual) se pagan directamente al trabajador en enero."},
  {id:"L12", t:"Cada contratista tiene un contrato de prestación de servicios escrito.", cond:"cont"}
 ]},
 {name:"Seguridad y salud en el trabajo (SG-SST)", cond:"emp",
  rec:"Designar un responsable del SG-SST, elaborar la matriz de peligros y el plan anual de trabajo, y realizar cada año la autoevaluación de estándares mínimos (Resolución 0312 de 2019). La ARL puede brindar asesoría sin costo.",
  items:[
  {id:"L13", t:"La empresa tiene designado un responsable del SG-SST.", crit:true,
   help:"SG-SST: Sistema de Gestión de Seguridad y Salud en el Trabajo, obligatorio para todas las empresas con trabajadores en Colombia."},
  {id:"L14", t:"La empresa tiene una matriz de identificación de peligros y valoración de riesgos.",
   help:"Documento que lista los peligros de cada puesto de trabajo, su nivel de riesgo y las medidas de control."},
  {id:"L15", t:"La empresa tiene un plan anual de trabajo de SST."},
  {id:"L16", t:"La empresa realizó en los últimos 12 meses la autoevaluación de estándares mínimos del SG-SST.", crit:true,
   help:"Autoevaluación exigida por la Resolución 0312 de 2019 del Ministerio del Trabajo; se reporta a la ARL."}
 ]},
 {name:"Comercial y protección al consumidor",
  rec:"Formalizar por escrito los acuerdos con clientes y proveedores principales. Si vende a consumidor final, verificar el cumplimiento del Estatuto del Consumidor (Ley 1480 de 2011): precios visibles, información de garantía y respuesta oportuna a las reclamaciones.",
  items:[
  {id:"L17", t:"La empresa formaliza por escrito sus acuerdos con sus clientes principales.",
   help:"Contrato, orden de compra firmada o propuesta aceptada por escrito."},
  {id:"L18", t:"La empresa formaliza por escrito sus acuerdos con sus proveedores principales."},
  {id:"L19", t:"La empresa exhibe sus precios con impuestos incluidos.", cond:"cf",
   help:"Obligación del Estatuto del Consumidor (Ley 1480 de 2011)."},
  {id:"L20", t:"La empresa informa por escrito a sus clientes las condiciones de garantía de sus productos o servicios.", cond:"cf"},
  {id:"L21", t:"La empresa responde las reclamaciones por garantía dentro de los 15 días hábiles que fija la ley.", cond:"cf"}
 ]},
 {name:"Datos personales y seguridad de la información",
  rec:"Adoptar una política de tratamiento de datos personales con autorizaciones escritas (Ley 1581 de 2012). Por separado, aplicar medidas técnicas de seguridad: copias de respaldo semanales y usuarios individuales con contraseña. Registrar la marca ante la Superintendencia de Industria y Comercio.",
  items:[
  {id:"L22", t:"La empresa tiene una política de tratamiento de datos personales.", crit:true,
   help:"Exigida por la Ley 1581 de 2012 a toda empresa que recolecte datos de personas (clientes, trabajadores, proveedores)."},
  {id:"L23", t:"La empresa pide autorización escrita a las personas antes de recolectar sus datos personales."},
  {id:"L24", t:"La empresa hace copias de seguridad de su información al menos cada semana.",
   help:"Esta práctica es de seguridad técnica de la información y es distinta de la política de datos personales."},
  {id:"L25", t:"Cada persona accede a los sistemas de la empresa con un usuario y una contraseña propios."},
  {id:"L26", t:"La empresa tiene registrada su marca ante la Superintendencia de Industria y Comercio.", opt:true,
   help:"Si la empresa no usa una marca propia (por ejemplo, solo revende marcas de terceros), marque «No aplica»."}
 ]}
]}
]
};
