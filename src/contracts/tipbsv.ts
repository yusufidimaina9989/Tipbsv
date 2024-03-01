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
  HashedSet,
  OffchainUpdates,
} from "scrypt-ts";

export type Project = {
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
  projects: HashedSet<Project>;

  constructor(projects : HashedSet<Project>) {
    super(...arguments);
    this.projects = projects
  }

  @method()
  public addProject(project: Project) {
    assert(!this.projects.has(project), "project already registered");

    // add project to the map
    this.projects.add(project)
    project.isRemoved = false

    let outputs = this.buildStateOutput(this.ctx.utxo.value);
    outputs += this.buildChangeOutput();
    assert(hash256(outputs) == this.ctx.hashOutputs, "hashOutputs mismatch");
  }

  @method()
  public like(project : Project) {
    assert(this.projects.has(project), "project not registered");

    // increase like count
    project.like += 1n;
    
    let outputs = this.buildStateOutput(this.ctx.utxo.value);
    
    outputs += this.buildChangeOutput();
    assert(hash256(outputs) == this.ctx.hashOutputs, "hashOutputs mismatch");
  }

  @method()
  public removed(project : Project) {
    assert(this.projects.has(project), "project not registered");

    // removing the current project
    assert(this.projects.delete(project))
    project.isRemoved = true;
    
    let outputs = this.buildStateOutput(this.ctx.utxo.value);
    
    outputs += this.buildChangeOutput();
    assert(hash256(outputs) == this.ctx.hashOutputs, "hashOutputs mismatch");
  }

  @method()
  public tip(project : Project, amount: bigint) {
    assert(this.projects.has(project), "project not registered");

    project.tipRecieved += amount;
    const tipAmount = (amount * 90n) / 100n;
    const percentage = (amount * 10n) / 100n;
    let outputs = this.buildStateOutput(this.ctx.utxo.value);
    outputs += Utils.buildPublicKeyHashOutput(project.projectAddr, tipAmount);
    outputs += Utils.buildPublicKeyHashOutput(project.percentage, percentage);
    outputs += this.buildChangeOutput();
    console.log("outputs : ", this.debug.diffOutputs(outputs));
    assert(hash256(outputs) == this.ctx.hashOutputs, "hashOutputs mismatch");
  }

  static tipTxBuilder(
    current: Tipbsv,
    options: MethodCallOptions<Tipbsv>,
    project: Project,
    amount: bigint
  ): Promise<ContractTransaction> {
    const projects = current.projects;
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
            Utils.buildPublicKeyHashScript(project.projectAddr)
          ),
          satoshis: Number(tipAmount),
        })
      )

      // Add payment to tipbsv percentage output.
      .addOutput(
        new bsv.Transaction.Output({
          script: bsv.Script.fromHex(
            Utils.buildPublicKeyHashScript(project.percentage)
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

  offchainUpdates: OffchainUpdates<Tipbsv> = {
    'addProject': (next: Tipbsv, project : Project) => {
        next.projects.add(project)
    },
    'removed': (next: Tipbsv, project : Project) => {
        next.projects.delete(project)
    },
}
}
