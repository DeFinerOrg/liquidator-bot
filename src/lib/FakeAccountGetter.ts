import TaskExecutor from './TaskExecutor';
import { logger } from './logger';
import { isAccountLiquidatable, borrowBalance } from '../helper/contractsHelper';
import Web3 from 'web3';

export class FakeAccountGetter extends TaskExecutor {

    accounts: string[];
    updateFreqSec: number;
    liquidatableAccounts: string[];
    user: string;
    liquidatorToken: string;
    web3: Web3;

    constructor(accounts: string[], updateFreqSec: number, user: string, liquidatorToken: string, web3: Web3) {
        super();
        this.accounts = accounts;
        this.user = user;
        this.updateFreqSec = updateFreqSec;
        this.liquidatableAccounts = [];
        this.liquidatorToken = liquidatorToken;
        this.web3 = web3;
    }

    initialize = async () => {
        // Do nothing now.
    }

    start = () => {
        logger.info({
            at: 'FakeAccountGetter#start',
            message: 'Starting FakeAccountGetter'
        });
        this.runUpdateAccounts();
    }

    getAllAccounts = () => {
        return this.accounts;
    }

    getLiquidatableAccounts = () => {
        return this.liquidatableAccounts;
    }

    runUpdateAccounts = async () => {
        for (; ;) {
            if (this.killed) return;
            this.liquidatableAccounts = [];

            try {
                for (let account of this.accounts) {
                    const liquidatableStatus = await isAccountLiquidatable(account, this.user, this.web3);
                    const balance = await borrowBalance(this.liquidatorToken, account, this.user, this.web3);
                    // Should have borrowed some tokens in liquidatorToken for the borrower.
                    if (liquidatableStatus && balance) {
                        this.liquidatableAccounts.push(account);
                    }
                }
            } catch (err) {
                logger.error({
                    at: 'FakeAccountGetter#runUpdateAccounts',
                    message: err.message
                });
            }

            logger.info({
                at: 'FakeAccountGetter#runUpdateAccounts',
                message: "Finish one round of runUpdateAccounts"
            });
            await this.wait(this.updateFreqSec);
        }
    }
}