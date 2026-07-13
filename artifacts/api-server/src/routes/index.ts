import { Router, type IRouter } from "express";
import healthRouter from "./health";
import stocksRouter from "./stocks";
import newsRouter from "./news";
import watchlistRouter from "./watchlist";
import portfolioRouter from "./portfolio";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(stocksRouter);
router.use(newsRouter);
router.use(watchlistRouter);
router.use(portfolioRouter);
router.use(dashboardRouter);

export default router;
