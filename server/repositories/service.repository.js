import { BaseRepository } from './base.repository.js';

export class ServiceRepository extends BaseRepository {
  constructor() {
    super('services', ['service_name', 'short_description', 'description']);
  }
}

export default new ServiceRepository();
