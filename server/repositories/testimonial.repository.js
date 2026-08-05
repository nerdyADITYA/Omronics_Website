import { BaseRepository } from './base.repository.js';

export class TestimonialRepository extends BaseRepository {
  constructor() {
    super('testimonials', ['customer_name', 'company_name', 'designation', 'review'], false);
  }
}

export default new TestimonialRepository();
