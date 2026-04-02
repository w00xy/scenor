import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';

@Injectable()
export class UsersRepository {
  constructor(private prisma: DatabaseService) {}

  async findAll(limit: number, offset: number) {
    return this.prisma.user.findMany({
      take: limit,
      skip: offset,
    });
  }

  async findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
    });
  }

  async create(data: { name: string; email: string; password: string }) {
    return this.prisma.user.create({
      data: {
        username: data.name,
        email: data.email,
        passwordHash: data.password,
      },
    });
  }

  async update(
    id: string,
    data: { name?: string; email?: string; password?: string },
  ) {
    return this.prisma.user.update({
      where: { id },
      data: {
        username: data.name,
        email: data.email,
        passwordHash: data.password,
      },
    });
  }

  async delete(id: string) {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
