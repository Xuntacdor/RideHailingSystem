import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelHistoryComponent } from './travel-history.component';

describe('TravelHistory', () => {
  let component: TravelHistoryComponent;
  let fixture: ComponentFixture<TravelHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TravelHistoryComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(TravelHistoryComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
