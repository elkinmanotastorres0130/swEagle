import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingDownloadComponent } from './loading-download.component';

describe('LoadingDownloadComponent', () => {
  let component: LoadingDownloadComponent;
  let fixture: ComponentFixture<LoadingDownloadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingDownloadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoadingDownloadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
