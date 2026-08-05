import { BaseRepository } from './base.repository.js';

export class IndustryRepository extends BaseRepository {
  constructor() {
    super('industries', ['industry_name', 'description']);
  }
}

export default new IndustryRepository();
