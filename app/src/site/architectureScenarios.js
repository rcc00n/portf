// Illustrative architecture options, not deployed-project claims or estimator input.
const products = {
  CRM: {
    accent: "#6571ff", colorName: "cobalt", title: "Lead update", actionLabel: "Run a lead update",
    summary: "Follow a pipeline change from the workspace into a durable record and its follow-up.",
    nodes: {
      frontend: ["Pipeline UI", "Capture an update", "A workspace for moving a lead without losing its context.", "Keep the current owner and stage visible before editing.", "Dense operational screens need deliberate keyboard and error handling."],
      backend: ["Workflow engine", "Apply transition rules", "Ownership and transition rules decide which changes are allowed.", "Validate permission and current state together.", "Configurable workflows are more demanding to test than fixed forms."],
      database: ["Records + audit", "Commit the change", "Lead state and the history of its changes share a transactional boundary.", "Commit the new stage and its audit entry together.", "A useful audit trail requires retention and access policies."],
      integrations: ["Email + calendar", "Synchronize follow-up", "External connectors receive follow-up work after the lead is recorded.", "Make synchronization repeatable without duplicating an activity.", "Provider delays must remain separate from the saved lead state."],
      admin: ["Operations", "Resolve exceptions", "Operators manage ownership, permissions and failed synchronization.", "Expose controlled corrections with a reason for each change.", "An override needs clear authority and a trace."],
      analytics: ["Pipeline insight", "Read stage movement", "Reporting follows recorded transitions rather than guessing from the UI.", "Derive conversion views from an explicit event definition.", "Reporting freshness and historical corrections need a shared meaning."],
    },
    queue: ["Follow-up queue", "Schedule automation", "Durable jobs separate follow-up delivery from the saved lead."],
    cache: ["Reference cache", "Reuse lookup data", "Frequently read stage and field options can be reused between edits."],
    replica: ["Reporting read model", "Isolate pipeline reads", "A separate read model serves pipeline views without owning lead writes."],
  },
  Marketplace: {
    accent: "#9890db", colorName: "violet", title: "Booking request", actionLabel: "Run a booking",
    summary: "Follow a booking through availability, payment authorization and operator oversight.",
    nodes: {
      frontend: ["Discovery + booking", "Request availability", "Customers move from a listing to a specific booking request.", "Show pending and confirmed bookings as different states.", "A pleasant checkout cannot hide availability or payment uncertainty."],
      backend: ["Booking rules", "Coordinate the booking", "Booking policy coordinates availability, fees and payment state.", "Treat reservation and payment as an explicit state machine.", "A failed authorization needs a compensating release of availability."],
      database: ["Booking ledger", "Hold availability", "Reservations and money-related state need a consistent record.", "Prevent conflicting holds inside the write transaction.", "Expired holds require cleanup even when the browser disappears."],
      integrations: ["Payments + identity", "Authorize payment", "Payment and identity providers have independent response and failure paths.", "Reconcile provider callbacks against the stored booking.", "A provider response can arrive late or more than once."],
      admin: ["Trust + disputes", "Review exceptions", "Operators need the booking, payment history and reason for an intervention.", "Keep dispute actions linked to the same booking record.", "Manual resolution must not silently rewrite financial history."],
      analytics: ["Marketplace insight", "Read matching outcomes", "Reporting distinguishes searches, requests and completed bookings.", "Measure outcomes from recorded booking states.", "A request is not a completed transaction."],
    },
    queue: ["Booking jobs", "Schedule provider work", "Durable work carries a booking reference into provider processing."],
    cache: ["Discovery cache", "Reuse listing reads", "Discovery results can be cached while booking still checks authoritative availability."],
    replica: ["Discovery read model", "Separate browse traffic", "A read model serves discovery and reporting while reservations stay on the primary."],
  },
  "E-commerce": {
    accent: "#80bdcb", colorName: "cyan", title: "Checkout", actionLabel: "Run a checkout",
    summary: "Follow checkout from a basket through stock reservation, payment and order state.",
    nodes: {
      frontend: ["Storefront", "Submit a basket", "The storefront gathers items and presents the state of checkout.", "Confirm prices and availability before accepting an order.", "Cached product pages can be older than the stock record."],
      backend: ["Order orchestration", "Validate checkout", "Order rules coordinate stock, discounts, tax and payment state.", "Keep checkout validation on the authoritative write path.", "More external dependencies create more recoverable partial states."],
      database: ["Orders + inventory", "Reserve stock", "Order and inventory records protect against competing purchases.", "Reserve stock atomically and record the order state.", "Abandoned reservations need expiry and reconciliation."],
      integrations: ["Payments + shipping", "Coordinate providers", "Payment and fulfillment providers operate outside the order transaction.", "Reconcile external results with an idempotent order update.", "A carrier or payment failure must not erase an accepted order."],
      admin: ["Commerce operations", "Handle returns", "Operators manage catalog exceptions, refunds and fulfillment issues.", "Make each adjustment explainable from the order history.", "Refunds and stock corrections need separate permission checks."],
      analytics: ["Commerce insight", "Read order outcomes", "Reporting follows accepted orders and their subsequent changes.", "Distinguish basket activity, orders and refunds.", "Conversion figures change when cancellation and refund rules differ."],
    },
    queue: ["Order jobs", "Schedule fulfillment", "Durable order jobs isolate provider work from the customer request."],
    cache: ["Catalog cache", "Reuse product reads", "Catalog reads can be cached; price and stock are checked again at checkout."],
    replica: ["Catalog read model", "Isolate catalog reads", "Browse and reporting queries move off the order-writing database."],
  },
};

const scales = {
  MVP: {
    decision: "Keep the core workflow in one application with explicit module boundaries.",
    tradeoff: "Fewer moving parts; application changes and operations remain coupled.",
    layers: {
      frontend: "Use one client-facing API for the initial workflow.",
      backend: "Keep orchestration inside one modular application.",
      database: "Start with one authoritative transactional database.",
      integrations: "Keep the first provider boundary narrow and observable.",
      admin: "Keep exceptional operations visible before automating them.",
      analytics: "Begin with deliberate queries over recorded events.",
    },
    cost: "The shared application and database remain a common operational boundary.",
  },
  Growth: {
    decision: "Add a cache for repeated reads and a durable queue for slow side effects.",
    tradeoff: "The request path becomes lighter; stale reads and retry behavior need explicit rules.",
    layers: {
      frontend: "Use cached reads without treating them as write authority.",
      backend: "Separate committed changes from deferred side effects.",
      database: "Record pending work durably with the business transaction.",
      integrations: "Run slow provider work through bounded background retries.",
      admin: "Expose pending, completed and failed jobs to operators.",
      analytics: "Read committed events rather than browser activity alone.",
    },
    cost: "Cache invalidation and job recovery add operational work.",
  },
  Scale: {
    decision: "Separate read models and background processing around measured contention.",
    tradeoff: "Independent read capacity brings replication lag and more reconciliation work.",
    layers: {
      frontend: "Make read freshness visible when confirmation matters.",
      backend: "Keep write invariants inside a clear ownership boundary.",
      database: "Keep primary writes separate from replicated read models.",
      integrations: "Isolate provider failures from the main write boundary.",
      admin: "Give operators visibility across jobs and read-model freshness.",
      analytics: "Serve reporting from the read model instead of competing with writes.",
    },
    cost: "Independent processing and read models can temporarily disagree.",
  },
};

const layouts = {
  MVP: [[.14,.22],[.5,.22],[.86,.22],[.14,.78],[.5,.78],[.86,.78]],
  Growth: [[.14,.17],[.5,.17],[.86,.17],[.14,.5],[.5,.5],[.86,.5],[.5,.83],[.86,.83]],
  Scale: [[.13,.23],[.37,.23],[.63,.23],[.87,.23],[.13,.77],[.37,.77],[.63,.77],[.87,.77]],
};
const placement = {
  CRM: {
    MVP: ["frontend","backend","integrations","admin","database","analytics"],
    Growth: ["frontend","cache","integrations","admin","backend","queue","database","analytics"],
    Scale: ["frontend","backend","queue","integrations","admin","database","replica","analytics"],
  },
  Marketplace: {
    MVP: ["frontend","backend","analytics","admin","database","integrations"],
    Growth: ["frontend","cache","analytics","admin","backend","integrations","database","queue"],
    Scale: ["frontend","backend","integrations","queue","admin","database","replica","analytics"],
  },
  "E-commerce": {
    MVP: ["frontend","backend","integrations","analytics","database","admin"],
    Growth: ["frontend","cache","analytics","admin","backend","queue","database","integrations"],
    Scale: ["frontend","backend","database","queue","admin","analytics","replica","integrations"],
  },
};
const baseIds = ["frontend","backend","integrations","admin","database","analytics"];
const extraLayers = { queue: "backend", cache: "database", replica: "database" };
const extraDetails = {
  queue: ["Commit the work reference before attempting delivery; make retries safe.", "A queue needs recovery, backoff and visibility when work fails."],
  cache: ["Expire or invalidate cached data; confirm consequential changes against the primary.", "A faster read can be stale. The cache must never decide a write invariant."],
  replica: ["Keep writes on the primary and track read-model freshness explicitly.", "Replication can lag; a recent write may not immediately appear in a read model."],
};
const extraContracts = {
  queue: {
    responsibilities: ["Persist work references before delivery", "Claim jobs without concurrent duplication", "Bound retries and expose failed work"],
    interfaces: ["Transactional outbox or durable enqueue", "Worker claims and acknowledgements", "Provider adapters and retry controls"],
    stack: ["Database-backed outbox", "Background worker process", "Message broker when justified by workload"],
  },
  cache: {
    responsibilities: ["Reuse frequently requested read results", "Expire or invalidate stale entries", "Fall back to the authoritative store on a miss"],
    interfaces: ["Cache-aside reads", "Versioned keys and invalidation events", "Explicit time-to-live policy"],
    stack: ["Redis or an application cache", "Shared cache key conventions", "Cache hit and freshness instrumentation"],
  },
  replica: {
    responsibilities: ["Project committed changes into a read model", "Serve browse and reporting queries", "Track lag and recover interrupted synchronization"],
    interfaces: ["Replication or committed-event stream", "Read-only query endpoint", "Freshness and checkpoint reporting"],
    stack: ["PostgreSQL read replica", "Projected read store where its shape differs", "Replication lag and checkpoint monitoring"],
  },
};

const mobilePlacement = {
  CRM: {
    MVP: ["admin","database","integrations","analytics"],
    Growth: ["admin","database","queue","integrations","cache","analytics"],
    Scale: ["admin","database","queue","integrations","replica","analytics"],
  },
  Marketplace: {
    MVP: ["database","integrations","admin","analytics"],
    Growth: ["cache","database","admin","integrations","queue","analytics"],
    Scale: ["database","queue","admin","integrations","replica","analytics"],
  },
  "E-commerce": {
    MVP: ["database","admin","analytics","integrations"],
    Growth: ["cache","database","queue","integrations","analytics","admin"],
    Scale: ["database","admin","queue","integrations","analytics","replica"],
  },
};

function buildEdges(product, scale) {
  const pairs = [["frontend","backend"],["backend","database"],["admin","backend"],["backend","integrations"]];
  if (scale === "MVP") pairs.push(["database","analytics",true]);
  if (scale === "Growth") pairs.push(["frontend","cache"],["cache","backend"],["database","queue",true],["queue","integrations",true],["database","analytics",true]);
  if (scale === "Scale") pairs.push(["database","queue",true],["queue","backend",true],["queue","integrations",true],["database","replica",true],["replica","analytics",true]);
  if (product === "Marketplace") pairs.push(["admin","integrations"]);
  if (product === "E-commerce") pairs.push(["admin","database"]);
  if (product === "CRM" && scale !== "MVP") pairs.push(["admin","queue",true]);
  return pairs.map(([from,to,async=false]) => ({id:`${from}-${to}`,from,to,async}));
}

function buildSteps(product, scale) {
  const crm = product === "CRM";
  const market = product === "Marketplace";
  const title = crm ? "lead" : market ? "booking" : "order";
  const steps = [
    ["frontend",crm ? "Edit a lead" : market ? "Request a booking" : "Submit checkout",crm ? "Choose a stage change in the pipeline." : market ? "Choose a listing and requested dates." : "Submit the basket for authoritative validation."],
  ];
  if (scale === "Growth") steps.push(["cache","Read supporting data","Reuse lookup data; availability and permissions are still checked on the write path."]);
  steps.push(
    ["backend",crm ? "Check ownership" : market ? "Check booking rules" : "Validate the basket",crm ? "Validate permissions and the allowed transition." : market ? "Validate booking policy and current availability." : "Validate current price, discounts and stock."],
    ["database",crm ? "Record the transition" : market ? "Hold availability" : "Reserve stock",crm ? "Commit the lead state and audit entry together." : `Persist a pending ${title} and its reservation before external work.`],
  );
  if (scale !== "MVP") steps.push(["queue",crm ? "Schedule follow-up" : "Schedule provider work",`Process the durable work reference for this ${title}; retry without duplicating the action.`]);
  if (!crm || scale === "Growth") {
    if (scale === "MVP") steps.push(["backend","Prepare authorization",`Use the stored ${title} reference for the provider request.`]);
    steps.push(["integrations",crm ? "Synchronize follow-up" : "Request authorization",crm ? "Synchronize the follow-up with the external provider." : "Request payment authorization; this does not yet mean the transaction is settled."]);
  }
  if (!crm || scale === "Scale") {
    steps.push(
      ["backend",crm ? "Apply automation" : "Reconcile the result",crm ? "Apply a permitted workflow action from the queued job." : "Validate the provider result and handle repeated callbacks safely."],
      ["database",crm ? "Commit the outcome" : `Confirm the ${title}`,crm ? "Record the completed action and its audit entry." : `Commit the ${title} state after successful authorization; failure would follow a recovery path.`],
    );
  }
  if (scale === "Scale") steps.push(["replica","Refresh the read model","Propagate committed state to the read model; freshness can lag."],["analytics","Read the outcome","Build reporting from the read model without competing with transactional writes."]);
  if (crm && scale === "MVP") steps.push(["analytics","Refresh pipeline insight","Read the committed stage transition for pipeline reporting."]);
  return steps.map(([node,stepTitle,detail]) => ({node,title:stepTitle,detail}));
}

export function buildArchitectureScenario(product, scale) {
  if (!Object.hasOwn(products, product) || !Object.hasOwn(scales, scale)) {
    throw new RangeError("Select a supported architecture product and scale.");
  }
  const profile = products[product];
  const operating = scales[scale];
  const ids = [...baseIds, ...(scale === "MVP" ? [] : ["queue",scale === "Growth" ? "cache" : "replica"])];
  const mobileOrder = ["frontend","backend",...mobilePlacement[product][scale]];
  const nodes = ids.map(id => {
    const layer = extraLayers[id] || id;
    const [title,role,summary,decision,tradeoff] = profile.nodes[id] || [...profile[id], ...extraDetails[id]];
    const [x,y] = layouts[scale][placement[product][scale].indexOf(id)];
    const mobileIndex = mobileOrder.indexOf(id);
    return {
      id, layer, title, role, summary,
      decision: extraLayers[id] ? decision : `${decision} ${operating.layers[layer]}`,
      tradeoff: extraLayers[id] ? tradeoff : `${tradeoff} ${operating.cost}`,
      ...(extraContracts[id] ? {details: Object.fromEntries(Object.entries(extraContracts[id]).map(([key,items])=>[key,[...items]]))} : {}),
      x, y, mobileX: mobileIndex % 2 ? .75 : .25,
      mobileY: scale === "MVP" ? [.17,.5,.83][Math.floor(mobileIndex/2)] : [.12,.37,.63,.88][Math.floor(mobileIndex/2)],
    };
  });
  return {
    id: `${product.toLowerCase()}-${scale.toLowerCase()}`,
    product, scale, accent: profile.accent, colorName: profile.colorName,
    title: profile.title, actionLabel: profile.actionLabel, summary: profile.summary,
    decision: operating.decision, tradeoff: operating.tradeoff,
    nodes, edges: buildEdges(product,scale), steps: buildSteps(product,scale),
  };
}
