import { ModuleWithProviders, NgModule } from '@angular/core';
import { ApplicationStore } from './application.store';
import { BulldozerProgramStore } from './bulldozer-program.store';
import { CollectionAttributeStore } from './collection-attribute.store';
import { CollectionStore } from './collection.store';
import { ConnectionStore } from './connection-store';
import { InstructionAccountStore } from './instruction-account.store';
import { InstructionArgumentStore } from './instruction-argument.store';
import { InstructionRelationStore } from './instruction-relation.store';
import { InstructionStore } from './instruction.store';
import { WorkspaceStore } from './workspace.store';

@NgModule({})
export class BulldozerProgramModule {
  static forRoot(): ModuleWithProviders<BulldozerProgramModule> {
    return {
      ngModule: BulldozerProgramModule,
      providers: [
        ConnectionStore,
        BulldozerProgramStore,
        WorkspaceStore,
        ApplicationStore,
        CollectionStore,
        CollectionAttributeStore,
        InstructionStore,
        InstructionAccountStore,
        InstructionArgumentStore,
        InstructionRelationStore,
      ],
    };
  }
}
