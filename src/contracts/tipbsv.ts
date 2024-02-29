
import {
  method,
  prop,
  SmartContract,
  hash256,
  assert,
  ByteString,
  FixedArray,
  toByteString,
  fill,
  Utils,
  MethodCallOptions,
  ContractTransaction,
  bsv,
  StatefulNext,
  Addr,
} from "scrypt-ts";

export type Item = {
  name: ByteString;
  title: ByteString;
  description: ByteString;
  projectAddr: Addr;
  contact: ByteString;
  tipRecieved: bigint;
  like : bigint;
  isRemoved: boolean;
  percentage: Addr; //10% for tipbsv
};

export class Tipbsv extends SmartContract {
  static readonly ITEM_SLOTS = 10;

  @prop(true)
  items: FixedArray<Item, typeof Tipbsv.ITEM_SLOTS>;

  constructor() {
    super(...arguments);
    this.items = fill(
      {
        name: toByteString(""),
        title: toByteString(""),
        description: toByteString(""),
        projectAddr: Addr(
          toByteString("0000000000000000000000000000000000000000")
        ),
        contact: toByteString(""),
        tipRecieved: 0n,
        like: 0n,
        isRemoved: true,
        percentage: Addr(
          toByteString("0000000000000000000000000000000000000000")
        ),
      },
      Tipbsv.ITEM_SLOTS
    );
  }

  @method()
  public addProject(item: Item, itemIdx: bigint) {
    assert(this.items[Number(itemIdx)].isRemoved, "item slot not empty");
    assert(
      !item.isRemoved,
      'new item cannot have the "isRemoved" flag set to true'
    );

    this.items[Number(itemIdx)] = item;

    let outputs = this.buildStateOutput(this.ctx.utxo.value);
    outputs += this.buildChangeOutput();
    assert(hash256(outputs) == this.ctx.hashOutputs, "hashOutputs mismatch");
  }

  @method()
  public like(itemIdx: bigint) {
    const item = this.items[Number(itemIdx)];

    this.items[Number(itemIdx)].like += 1n;
    
    let outputs = this.buildStateOutput(this.ctx.utxo.value);
    
    outputs += this.buildChangeOutput();
    assert(hash256(outputs) == this.ctx.hashOutputs, "hashOutputs mismatch");
  }

  @method()
  public removed(itemIdx: bigint) {
    const item = this.items[Number(itemIdx)];

    this.items[Number(itemIdx)].isRemoved = true;
    
    let outputs = this.buildStateOutput(this.ctx.utxo.value);
    
    outputs += this.buildChangeOutput();
    assert(hash256(outputs) == this.ctx.hashOutputs, "hashOutputs mismatch");
  }

  @method()
  public tip(itemIdx: bigint, amount: bigint) {
    const item = this.items[Number(itemIdx)];

    this.items[Number(itemIdx)].tipRecieved += amount;
    const tipAmount = (amount * 90n) / 100n;
    const percentage = (amount * 10n) / 100n;
    let outputs = this.buildStateOutput(this.ctx.utxo.value);
    outputs += Utils.buildPublicKeyHashOutput(item.projectAddr, tipAmount);
    outputs += Utils.buildPublicKeyHashOutput(item.percentage, percentage);
    outputs += this.buildChangeOutput();
    console.log("outputs : ", this.debug.diffOutputs(outputs));
    assert(hash256(outputs) == this.ctx.hashOutputs, "hashOutputs mismatch");
  }

  static tipTxBuilder(
    current: Tipbsv,
    options: MethodCallOptions<Tipbsv>,
    idx: bigint,
    amount: bigint
  ): Promise<ContractTransaction> {
    const item = current.items[Number(idx)];
    const next = options.next as StatefulNext<Tipbsv>;

    const tipAmount = (amount * 90n) / 100n;
    const percentage = (amount * 10n) / 100n;
    const unsignedTx: bsv.Transaction = new bsv.Transaction()
      // Add contract input.
      .addInput(current.buildContractInput(options.fromUTXO))
      // Build next instance output.
      .addOutput(
        new bsv.Transaction.Output({
          script: next.instance.lockingScript,
          satoshis: next.balance,
        })
      )
      // Add payment to project output.
      .addOutput(
        new bsv.Transaction.Output({
          script: bsv.Script.fromHex(
            Utils.buildPublicKeyHashScript(item.projectAddr)
          ),
          satoshis: Number(tipAmount),
        })
      )

      // Add payment to tipbsv percentage output.
      .addOutput(
        new bsv.Transaction.Output({
          script: bsv.Script.fromHex(
            Utils.buildPublicKeyHashScript(item.percentage)
          ),
          satoshis: Number(percentage),
        })
      );

    // Build change output
    // TODO CHECK IF STILL ADDS CHANGE WITHOUT OPTION
    if (options.changeAddress) {
      unsignedTx.change(options.changeAddress);
    }

    return Promise.resolve({
      tx: unsignedTx,
      atInputIndex: 0,
      nexts: [
        {
          instance: next.instance,
          atOutputIndex: 0,
          balance: next.balance,
        },
      ],
    });
  }
}
