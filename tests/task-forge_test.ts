import {
  Clarinet,
  Tx,
  Chain,
  Account,
  types
} from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "Can create new task",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet_1 = accounts.get("wallet_1")!;
    
    let block = chain.mineBlock([
      Tx.contractCall(
        "task-forge",
        "create-task",
        [
          types.utf8("Test Task"),
          types.utf8("Test Description")
        ],
        wallet_1.address
      )
    ]);
    
    assertEquals(block.receipts.length, 1);
    assertEquals(block.height, 2);
    assertEquals(block.receipts[0].result, '(ok u1)');
  },
});

Clarinet.test({
  name: "Can assign task to user",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet_1 = accounts.get("wallet_1")!;
    const wallet_2 = accounts.get("wallet_2")!;
    
    let block = chain.mineBlock([
      Tx.contractCall(
        "task-forge",
        "create-task",
        [
          types.utf8("Test Task"),
          types.utf8("Test Description")
        ],
        wallet_1.address
      ),
      Tx.contractCall(
        "task-forge",
        "assign-task",
        [
          types.uint(1),
          types.principal(wallet_2.address)
        ],
        wallet_1.address
      )
    ]);
    
    assertEquals(block.receipts.length, 2);
    assertEquals(block.height, 2);
    assertEquals(block.receipts[1].result, '(ok true)');
  },
});

Clarinet.test({
  name: "Can update task status",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet_1 = accounts.get("wallet_1")!;
    
    let block = chain.mineBlock([
      Tx.contractCall(
        "task-forge",
        "create-task",
        [
          types.utf8("Test Task"),
          types.utf8("Test Description")
        ],
        wallet_1.address
      ),
      Tx.contractCall(
        "task-forge",
        "update-task-status",
        [
          types.uint(1),
          types.ascii("IN_PROGRESS")
        ],
        wallet_1.address
      )
    ]);
    
    assertEquals(block.receipts.length, 2);
    assertEquals(block.height, 2);
    assertEquals(block.receipts[1].result, '(ok true)');
  },
});
