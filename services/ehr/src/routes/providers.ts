/**
 * EHR Providers Routes - Healthcare provider management
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { PrismaClient } from "@prisma/client";

interface ProvidersRouteOptions {
  prisma: PrismaClient;
}

interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    id: string;
    role: string;
  };
  requestId: string;
}

export async function providersRoutes(
  fastify: FastifyInstance,
  options: ProvidersRouteOptions,
) {
  const { prisma } = options;

  /**
   * GET /providers - Get all providers
   */
  fastify.get(
    "/",
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
      const query = request.query as any;

      try {
        const { page = 1, limit = 20, specialty, active = true } = query;

        const providers = await getProviders({
          page: parseInt(page),
          limit: parseInt(limit),
          specialty,
          active: active === "true",
        });

        reply.send(providers);
      } catch (error) {
        fastify.log.error(error, "Error fetching providers");
        reply.status(500).send({
          success: false,
          error: "Internal server error",
          message: "Failed to fetch providers",
        });
      }
    },
  );

  /**
   * GET /providers/:id - Get provider by ID
   */
  fastify.get(
    "/:id",
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };

      try {
        const provider = await getProviderById(id);

        if (!provider) {
          reply.status(404).send({
            success: false,
            error: "Provider not found",
          });
          return;
        }

        reply.send(provider);
      } catch (error) {
        fastify.log.error(error, "Error fetching provider");
        reply.status(500).send({
          success: false,
          error: "Internal server error",
          message: "Failed to fetch provider",
        });
      }
    },
  );

  /**
   * GET /providers/network - Get provider network
   */
  fastify.get(
    "/network",
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
      const query = request.query as any;

      try {
        const { location, specialty, insuranceAccepted } = query;

        const network = await getProviderNetwork({
          location,
          specialty,
          insuranceAccepted,
        });

        reply.send(network);
      } catch (error) {
        fastify.log.error(error, "Error fetching provider network");
        reply.status(500).send({
          success: false,
          error: "Internal server error",
          message: "Failed to fetch provider network",
        });
      }
    },
  );

  /**
   * POST /providers - Create new provider
   */
  fastify.post(
    "/",
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
      try {
        const providerData = request.body as any;

        // Only admins can create providers
        if (request.user?.role !== "admin") {
          reply.status(403).send({
            success: false,
            error: "Access denied",
            message: "Only administrators can create providers",
          });
          return;
        }

        const newProvider = await createProvider({
          ...providerData,
          createdBy: request.user.id,
        });

        fastify.log.info(
          {
            providerId: newProvider.id,
            createdBy: request.user.id,
            requestId: request.requestId,
          },
          "Provider created",
        );

        reply.status(201).send({
          id: newProvider.id,
          status: "created",
          message: "Provider created successfully",
        });
      } catch (error) {
        fastify.log.error(error, "Error creating provider");
        reply.status(500).send({
          success: false,
          error: "Internal server error",
          message: "Failed to create provider",
        });
      }
    },
  );

  /**
   * PUT /providers/:id - Update provider
   */
  fastify.put(
    "/:id",
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };

      try {
        const updateData = request.body as any;

        // Check permissions
        if (request.user?.role !== "admin" && request.user?.id !== id) {
          reply.status(403).send({
            success: false,
            error: "Access denied",
            message: "You can only update your own profile",
          });
          return;
        }

        const updatedProvider = await updateProvider(id, {
          ...updateData,
          updatedBy: request.user?.id,
        });

        if (!updatedProvider) {
          reply.status(404).send({
            success: false,
            error: "Provider not found",
          });
          return;
        }

        fastify.log.info(
          {
            providerId: id,
            updatedBy: request.user?.id,
            requestId: request.requestId,
          },
          "Provider updated",
        );

        reply.send({
          id: updatedProvider.id,
          status: "updated",
          message: "Provider updated successfully",
        });
      } catch (error) {
        fastify.log.error(error, "Error updating provider");
        reply.status(500).send({
          success: false,
          error: "Internal server error",
          message: "Failed to update provider",
        });
      }
    },
  );

  /**
   * DELETE /providers/:id - Deactivate provider
   */
  fastify.delete(
    "/:id",
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };

      try {
        // Only admins can deactivate providers
        if (request.user?.role !== "admin") {
          reply.status(403).send({
            success: false,
            error: "Access denied",
            message: "Only administrators can deactivate providers",
          });
          return;
        }

        const deactivated = await deactivateProvider(id);

        if (!deactivated) {
          reply.status(404).send({
            success: false,
            error: "Provider not found",
          });
          return;
        }

        fastify.log.info(
          {
            providerId: id,
            deactivatedBy: request.user.id,
            requestId: request.requestId,
          },
          "Provider deactivated",
        );

        reply.send({
          id,
          status: "deactivated",
          message: "Provider deactivated successfully",
        });
      } catch (error) {
        fastify.log.error(error, "Error deactivating provider");
        reply.status(500).send({
          success: false,
          error: "Internal server error",
          message: "Failed to deactivate provider",
        });
      }
    },
  );
}

// Helper functions

/**
 * Get providers list
 */
async function getProviders(params: {
  page: number;
  limit: number;
  specialty?: string;
  active?: boolean;
}): Promise<any> {
  // Mock implementation
  const providers = [
    {
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Dr. John Smith",
      specialty: "Internal Medicine",
      email: "dr.smith@telecheck.health",
      phone: "+1-555-0125",
      isActive: true,
      rating: 4.8,
      yearsExperience: 15,
      education: ["Harvard Medical School", "Johns Hopkins Residency"],
      certifications: ["Board Certified Internal Medicine"],
      languagesSpoken: ["English", "Spanish"],
      availability: {
        monday: "09:00-17:00",
        tuesday: "09:00-17:00",
        wednesday: "09:00-17:00",
        thursday: "09:00-17:00",
        friday: "09:00-15:00",
      },
    },
    {
      id: "660f9511-f3ac-52e5-b827-557766551111",
      name: "Dr. Sarah Johnson",
      specialty: "Cardiology",
      email: "dr.johnson@telecheck.health",
      phone: "+1-555-0126",
      isActive: true,
      rating: 4.9,
      yearsExperience: 12,
      education: ["Stanford Medical School", "Mayo Clinic Fellowship"],
      certifications: ["Board Certified Cardiology"],
      languagesSpoken: ["English", "French"],
    },
  ];

  // Filter by specialty if provided
  let filteredProviders = providers;
  if (params.specialty) {
    filteredProviders = providers.filter((p) =>
      p.specialty.toLowerCase().includes(params.specialty.toLowerCase()),
    );
  }

  // Filter by active status
  if (params.active !== undefined) {
    filteredProviders = filteredProviders.filter(
      (p) => p.isActive === params.active,
    );
  }

  return {
    providers: filteredProviders,
    pagination: {
      page: params.page,
      limit: params.limit,
      total: filteredProviders.length,
      totalPages: Math.ceil(filteredProviders.length / params.limit),
    },
  };
}

/**
 * Get provider by ID
 */
async function getProviderById(id: string): Promise<any> {
  const providers = await getProviders({ page: 1, limit: 100 });
  return providers.providers.find((p: any) => p.id === id) || null;
}

/**
 * Get provider network
 */
async function getProviderNetwork(params: {
  location?: string;
  specialty?: string;
  insuranceAccepted?: string;
}): Promise<any> {
  // Mock implementation
  const network = {
    providers: await getProviders({ page: 1, limit: 50 }),
    coverage: {
      totalProviders: 250,
      specialties: [
        "Internal Medicine",
        "Cardiology",
        "Dermatology",
        "Endocrinology",
        "Gastroenterology",
        "Neurology",
        "Oncology",
        "Orthopedics",
        "Psychiatry",
        "Radiology",
      ],
      locations: [
        "Boston, MA",
        "New York, NY",
        "Philadelphia, PA",
        "Washington, DC",
        "Atlanta, GA",
      ],
      insurancePartners: [
        "Blue Cross Blue Shield",
        "Aetna",
        "Cigna",
        "UnitedHealthcare",
        "Humana",
      ],
    },
  };

  return network;
}

/**
 * Create new provider
 */
async function createProvider(data: any): Promise<any> {
  // Mock implementation
  const newProvider = {
    id: `provider_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ...data,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return newProvider;
}

/**
 * Update provider
 */
async function updateProvider(id: string, data: any): Promise<any> {
  // Mock implementation
  const existingProvider = await getProviderById(id);

  if (!existingProvider) {
    return null;
  }

  return {
    ...existingProvider,
    ...data,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Deactivate provider
 */
async function deactivateProvider(id: string): Promise<boolean> {
  // Mock implementation
  const existingProvider = await getProviderById(id);
  return !!existingProvider;
}
