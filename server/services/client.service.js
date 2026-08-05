import clientRepository from '../repositories/client.repository.js';
import { AppError } from '../middlewares/error.middleware.js';
import { MESSAGES } from '../constants/messages.js';

export class ClientService {
  async getAll(params) {
    return clientRepository.findAll({ ...params, isSoftDelete: false });
  }

  async getById(id) {
    const client = await clientRepository.findById(id, false);
    if (!client) throw new AppError(MESSAGES.NOT_FOUND, 404);
    return client;
  }

  async create(data) {
    const payload = {
      client_name: data.client_name,
      logo_url: data.logo_url,
      website_url: data.website_url || null,
      description: data.description || null,
      sort_order: data.sort_order || 0,
      status: data.status || 'ACTIVE',
    };
    return clientRepository.create(payload);
  }

  async update(id, data) {
    await this.getById(id);
    return clientRepository.update(id, data);
  }

  async delete(id) {
    await this.getById(id);
    return clientRepository.delete(id, false);
  }
}

export default new ClientService();
