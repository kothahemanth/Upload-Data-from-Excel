using { com.hemanth.satinfotech as db } from '../db/schema';

service satinfotech @cds.persistence.skip
@odata.singleton {
    entity Branch as projection on db.Branch;
}

annotate satinfotech.Branch with @odata.draft.enabled;
