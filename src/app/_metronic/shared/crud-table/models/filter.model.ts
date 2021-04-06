import { FormGroup } from '@angular/forms';
import { RestrictionTypeEnum } from './restriction-type-enum';

export interface IFilterView {
  filterGroup: FormGroup;
  ngOnInit(): void;
  filterForm(): void;
  filter(): void;
}

export interface FilterState {
  column: string;
  value: string;
  restrictionType?: RestrictionTypeEnum;
}
