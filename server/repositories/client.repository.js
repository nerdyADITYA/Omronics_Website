import { BaseRepository } from './base.repository.js';

export class ClientRepository extends BaseRepository {
  constructor() {
    super('clients', ['client_name', 'description'], false);
  }
}

export default new ClientRepository();
