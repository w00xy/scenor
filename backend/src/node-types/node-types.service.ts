import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { DEFAULT_NODE_TYPES } from './node-types.defaults.js';

@Injectable()
export class NodeTypesService {
  constructor(private readonly prisma: DatabaseService) {}

  async listActiveNodeTypes() {
    return this.prisma.nodeType.findMany({
      where: { isActive: true },
      orderBy: [{ category: 'asc' }, { displayName: 'asc' }],
    });
  }

  async seedDefaultNodeTypes() {
    const seeded = await this.prisma.$transaction(
      DEFAULT_NODE_TYPES.map((nodeType) =>
        this.prisma.nodeType.upsert({
          where: { code: nodeType.code },
          create: {
            code: nodeType.code,
            displayName: nodeType.displayName,
            category: nodeType.category,
            description: nodeType.description,
            icon: nodeType.icon,
            isTrigger: nodeType.isTrigger,
            supportsCredentials: nodeType.supportsCredentials,
            schemaJson: nodeType.schemaJson,
            defaultConfigJson: nodeType.defaultConfigJson,
            isActive: true,
          },
          update: {
            displayName: nodeType.displayName,
            category: nodeType.category,
            description: nodeType.description,
            icon: nodeType.icon,
            isTrigger: nodeType.isTrigger,
            supportsCredentials: nodeType.supportsCredentials,
            schemaJson: nodeType.schemaJson,
            defaultConfigJson: nodeType.defaultConfigJson,
            isActive: true,
          },
        }),
      ),
    );

    return {
      count: seeded.length,
      items: seeded,
    };
  }
}
