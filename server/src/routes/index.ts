import { Router } from 'express';
import auth from './auth';
import entrepreneurs from './entrepreneurs';
import services from './services';
import products from './products';
import orders from './orders';
import reviews from './reviews';
import admin from './admin';
import favorites from './favorites';

export const router = Router();

router.use('/auth', auth);
router.use('/entrepreneurs', entrepreneurs);
router.use('/services', services);
router.use('/products', products);
router.use('/orders', orders);
router.use('/reviews', reviews);
router.use('/admin', admin);
router.use('/favorites', favorites);
