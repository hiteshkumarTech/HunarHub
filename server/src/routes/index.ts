import { Router } from 'express';
import auth from './auth';
import entrepreneurs from './entrepreneurs';
import services from './services';
import products from './products';
import orders from './orders';
import reviews from './reviews';
import admin from './admin';
import favorites from './favorites';
import listings from './listings';
import categories from './categories';
import complaints from './complaints';

export const router = Router();

router.use('/auth', auth);
router.use('/entrepreneurs', entrepreneurs);
router.use('/services', services);
router.use('/products', products);
router.use('/orders', orders);
router.use('/reviews', reviews);
router.use('/admin', admin);
router.use('/favorites', favorites);
router.use('/listings', listings);
router.use('/categories', categories);
router.use('/complaints', complaints);
