import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TradingDecisionsComponent } from './trading-decisions.component';

describe('TradingDecisionsComponent', () => {
  let component: TradingDecisionsComponent;
  let fixture: ComponentFixture<TradingDecisionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TradingDecisionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TradingDecisionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
