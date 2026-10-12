import type { Blueprint, Project } from "@/types/genesis";
const stamp = "2026-10-06T09:00:00.000Z";
export const sampleProjects: Project[] = [
  {
    project_id: "proj_demo",
    project_name: "Food Delivery Platform",
    project_description:
      "Connect local restaurants, customers and delivery partners in one reliable ordering experience.",
    status: "COMPLETED",
    created_at: stamp,
    updated_at: stamp,
    documents: [
      {
        document_id: "doc_demo",
        project_id: "proj_demo",
        filename: "client-requirements.pdf",
        file_type: "pdf",
        status: "PROCESSED",
        file_size: 184320,
      },
    ],
  },
  {
    project_id: "proj_draft",
    project_name: "Healthcare Appointment System",
    project_description:
      "Help patients discover clinics and book appointments with available practitioners.",
    status: "CREATED",
    created_at: stamp,
    updated_at: stamp,
    documents: [],
  },
];
// Proposed nested fields, pending Members 1 and 3. This is an illustrative fixture, not AI output.
export function sampleBlueprint(project_id: string): Blueprint {
  return {
    blueprint_id: `bp_${project_id}`,
    project_id,
    created_at: stamp,
    updated_at: stamp,
    version: 1,
    scope: {
      in_scope: [
        "Customer registration and restaurant discovery",
        "Menu browsing, cart and order checkout",
        "Restaurant order management",
        "Delivery assignment and order status",
      ],
      out_of_scope: [
        "Multi-country operations",
        "In-house payment processing",
        "Native mobile applications",
      ],
      assumptions: [
        "One launch region",
        "Third-party payment and mapping providers",
      ],
      constraints: ["Small delivery team", "Web-first MVP"],
    },
    requirements: [
      {
        requirement_id: "FR-001",
        project_id,
        document_id: "doc_demo",
        type: "FUNCTIONAL",
        description: "Customers can register and securely sign in with email.",
        priority: "CRITICAL",
        source_reference: { page: 2, section: "Customer accounts" },
        status: "IDENTIFIED",
      },
      {
        requirement_id: "FR-002",
        project_id,
        type: "FUNCTIONAL",
        description:
          "Customers can browse restaurants and filter menus by availability.",
        priority: "HIGH",
        source_reference: { page: 3, section: "Discovery" },
        status: "IDENTIFIED",
      },
      {
        requirement_id: "FR-003",
        project_id,
        type: "FUNCTIONAL",
        description:
          "Customers can place an order and view its delivery status.",
        priority: "HIGH",
        source_reference: { page: 4 },
        status: "IDENTIFIED",
      },
      {
        requirement_id: "NFR-001",
        project_id,
        type: "NON_FUNCTIONAL",
        description: "Protect customer information in transit and at rest.",
        priority: "CRITICAL",
        source_reference: { section: "Security" },
        status: "NEEDS_REVIEW",
      },
    ],
    user_roles: [
      {
        role_id: "ROLE-001",
        name: "Customer",
        description:
          "Discovers restaurants, places orders and tracks deliveries.",
      },
      {
        role_id: "ROLE-002",
        name: "Restaurant manager",
        description: "Maintains menus and accepts incoming orders.",
      },
      {
        role_id: "ROLE-003",
        name: "Delivery partner",
        description: "Accepts assignments and updates delivery status.",
      },
      {
        role_id: "ROLE-004",
        name: "Administrator",
        description: "Oversees platform operations and manages access.",
      },
    ],
    features: [
      {
        feature_id: "FEAT-001",
        name: "Identity & access",
        description: "Secure registration and role-based access.",
        priority: "CRITICAL",
        requirement_ids: ["FR-001", "NFR-001"],
      },
      {
        feature_id: "FEAT-002",
        name: "Restaurant discovery",
        description: "Searchable restaurants and available menus.",
        priority: "HIGH",
        requirement_ids: ["FR-002"],
      },
      {
        feature_id: "FEAT-003",
        name: "Order lifecycle",
        description: "Checkout, restaurant acceptance and delivery updates.",
        priority: "HIGH",
        requirement_ids: ["FR-003"],
      },
    ],
    user_stories: [
      {
        user_story_id: "US-001",
        description:
          "As a customer, I want to sign in securely so that I can manage my orders.",
        role_id: "ROLE-001",
        feature_id: "FEAT-001",
        requirement_ids: ["FR-001", "NFR-001"],
      },
      {
        user_story_id: "US-002",
        description:
          "As a customer, I want to browse available menus so that I can choose my meal.",
        role_id: "ROLE-001",
        feature_id: "FEAT-002",
        requirement_ids: ["FR-002"],
      },
      {
        user_story_id: "US-003",
        description:
          "As a customer, I want to track my order so that I know when it will arrive.",
        role_id: "ROLE-001",
        feature_id: "FEAT-003",
        requirement_ids: ["FR-003"],
      },
    ],
    architecture: {
      architecture_id: "ARCH-001",
      style: "Modular monolith",
      reasoning:
        "A single deployable service keeps the MVP manageable while preserving module boundaries.",
      components: [
        {
          component_id: "ARCH-COMP-01",
          name: "Web application",
          responsibility: "Customer and operations interfaces",
        },
        {
          component_id: "ARCH-COMP-02",
          name: "Identity module",
          responsibility: "Authentication and access control",
        },
        {
          component_id: "ARCH-COMP-03",
          name: "Order module",
          responsibility: "Checkout and order state transitions",
        },
      ],
      relationships: [
        "Web application → Identity module",
        "Web application → Order module",
        "Order module → Payment provider",
      ],
      data_flow: [
        "Customer submits an order",
        "Service validates menu and availability",
        "Payment provider authorizes payment",
        "Restaurant receives order",
        "Delivery partner updates fulfillment",
      ],
    },
    technology_stack: {
      technology_stack_id: "TECH-001",
      frontend: [
        {
          technology: "React",
          reason: "Reusable interfaces across customer and operations views.",
        },
      ],
      backend: [
        {
          technology: "Django REST Framework",
          reason:
            "Established authentication and administration tools suit the operational MVP.",
        },
      ],
      database: [
        {
          technology: "PostgreSQL",
          reason: "Transactions preserve order and payment consistency.",
        },
      ],
      infrastructure: [
        {
          technology: "Managed container hosting",
          reason: "Reduces operations work for a small team.",
        },
      ],
      other: [
        {
          technology: "Hosted payment provider",
          reason: "Delegates payment capture and card handling.",
        },
      ],
    },
    database_design: {
      database_design_id: "DB-001",
      database_type: "Relational",
      entities: [
        {
          entity_id: "DB-ENTITY-01",
          name: "Users",
          fields: ["user_id", "email", "password_hash", "role"],
        },
        {
          entity_id: "DB-ENTITY-02",
          name: "Restaurants",
          fields: ["restaurant_id", "name", "address"],
        },
        {
          entity_id: "DB-ENTITY-03",
          name: "Orders",
          fields: [
            "order_id",
            "customer_id",
            "restaurant_id",
            "status",
            "total",
          ],
        },
      ],
      relationships: ["Users 1 → many Orders", "Restaurants 1 → many Orders"],
    },
    api_design: [
      {
        api_design_id: "API-001",
        method: "POST",
        endpoint: "/api/auth/register",
        description: "Create a customer account.",
        authentication: "Public; rate limited",
        request: { email: "string", password: "string" },
        response: { user_id: "string" },
      },
      {
        api_design_id: "API-002",
        method: "GET",
        endpoint: "/api/restaurants",
        description: "Browse available restaurants.",
        authentication: "Public",
        request: { search: "optional string" },
        response: { restaurants: "Restaurant[]" },
      },
      {
        api_design_id: "API-003",
        method: "POST",
        endpoint: "/api/orders",
        description: "Create an order from the customer cart.",
        authentication: "Customer session",
        request: { restaurant_id: "string", items: "OrderItem[]" },
        response: { order_id: "string", status: "string" },
      },
    ],
    security: {
      security_id: "SEC-001",
      authentication: [
        "Secure sessions with rotation and expiry",
        "Modern password hashing",
      ],
      authorization: [
        "Role-based access for customer, restaurant, delivery and admin",
        "Resource ownership checks on every order",
      ],
      data_protection: [
        "TLS for all transport",
        "Encrypted database backups",
        "Minimize retained personal information",
      ],
      considerations: [
        "Validate all external input",
        "Rate limit authentication endpoints",
        "Audit privileged operations",
      ],
    },
    development_breakdown: [
      {
        task_id: "TASK-001",
        title: "Implement secure customer accounts",
        description: "Registration, login, session expiry and access checks.",
        module: "Identity",
        priority: "CRITICAL",
        estimated_hours: { min: 24, max: 32 },
        requirement_ids: ["FR-001", "NFR-001"],
        feature_ids: ["FEAT-001"],
      },
      {
        task_id: "TASK-002",
        title: "Build restaurant and menu discovery",
        description: "Restaurant listings, menu details and availability.",
        module: "Discovery",
        priority: "HIGH",
        estimated_hours: { min: 32, max: 40 },
        requirement_ids: ["FR-002"],
        feature_ids: ["FEAT-002"],
      },
      {
        task_id: "TASK-003",
        title: "Implement order lifecycle",
        description: "Checkout, order management and delivery status.",
        module: "Orders",
        priority: "HIGH",
        estimated_hours: { min: 48, max: 64 },
        requirement_ids: ["FR-003"],
        feature_ids: ["FEAT-003"],
      },
    ],
    effort_estimation: {
      estimation_id: "EST-001",
      estimated_hours: { min: 180, max: 220 },
      confidence: "MEDIUM",
      assumptions: [
        "One experienced full-stack developer",
        "Managed hosting and payment providers",
        "Includes integration and testing beyond the representative tasks shown",
      ],
    },
    timeline: {
      timeline_id: "TIME-001",
      estimated_weeks: { min: 5, max: 7 },
      phases: [
        { name: "Planning & design", duration: "1 week" },
        { name: "Core development", duration: "3–4 weeks" },
        { name: "Integration & testing", duration: "1–2 weeks" },
      ],
      assumptions: [
        "Client feedback available within two business days",
        "No fixed launch date has been agreed",
      ],
    },
    cost_estimation: {
      cost_estimation_id: "COST-001",
      currency: "INR",
      development_cost: { min: 108000, max: 132000 },
      third_party_costs: { min: 2000, max: 5000 },
      infrastructure_costs: { min: 3000, max: 6000 },
      total_estimated_cost: { min: 113000, max: 143000 },
      assumptions: [
        "Initial delivery period only",
        "Recurring provider fees vary with usage",
      ],
    },
    quotation: {
      quotation_id: "QUOTE-001",
      currency: "INR",
      recommended_range: { min: 120000, max: 150000 },
      pricing_basis:
        "Estimated delivery effort plus contingency and initial provider costs.",
      assumptions: [
        "Scope limited to the listed MVP",
        "Taxes and ongoing maintenance excluded",
      ],
      validity: "14 days from client issue date",
      estimated_effort: "180–220 hours",
      estimated_timeline: "5–7 weeks",
    },
    roadmap: {
      roadmap_id: "ROAD-001",
      phases: [
        {
          name: "Planning",
          estimated_duration: "3–5 days",
          tasks: ["Confirm scope and acceptance criteria"],
          dependencies: [],
        },
        {
          name: "Design",
          estimated_duration: "2–3 days",
          tasks: ["Approve architecture and data model"],
          dependencies: ["Planning"],
        },
        {
          name: "Development",
          estimated_duration: "3–4 weeks",
          tasks: ["TASK-001", "TASK-002", "TASK-003"],
          dependencies: ["Design"],
        },
        {
          name: "Testing",
          estimated_duration: "4–6 days",
          tasks: ["Integration and acceptance testing"],
          dependencies: ["Development"],
        },
        {
          name: "Deployment",
          estimated_duration: "1–2 days",
          tasks: ["Production configuration and release checks"],
          dependencies: ["Testing"],
        },
      ],
    },
    traceability: [
      {
        traceability_id: "TRACE-001",
        requirement_id: "FR-001",
        feature_id: "FEAT-001",
        user_story_id: "US-001",
        architecture_component_id: "ARCH-COMP-02",
        database_entity_id: "DB-ENTITY-01",
        api_design_id: "API-001",
        task_id: "TASK-001",
      },
      {
        traceability_id: "TRACE-002",
        requirement_id: "FR-002",
        feature_id: "FEAT-002",
        user_story_id: "US-002",
        architecture_component_id: "ARCH-COMP-01",
        database_entity_id: "DB-ENTITY-02",
        api_design_id: "API-002",
        task_id: "TASK-002",
      },
      {
        traceability_id: "TRACE-003",
        requirement_id: "FR-003",
        feature_id: "FEAT-003",
        user_story_id: "US-003",
        architecture_component_id: "ARCH-COMP-03",
        database_entity_id: "DB-ENTITY-03",
        api_design_id: "API-003",
        task_id: "TASK-003",
      },
    ],
  };
}
