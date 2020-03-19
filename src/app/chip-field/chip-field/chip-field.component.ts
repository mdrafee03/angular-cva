import { Component, OnInit, forwardRef, Input, ViewChild, ElementRef, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, FormBuilder, FormGroup } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import { Observable, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
@Component({
  selector: 'app-chip-field',
  templateUrl: './chip-field.component.html',
  styleUrls: ['./chip-field.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ChipFieldComponent),
      multi: true
    }
  ]
})
export class ChipFieldComponent implements OnInit, ControlValueAccessor {
  @Input() placeholder = 'Select Options';
  @Input() clientSideFilter = true;
  @Input() options: any[];
  @Input() maxLen: number;
  @Input() removable = true;
  @Input() isOptionString = false;
  @Input() displayWith = 'value';
  @Input() itemId = 'key';
  @Input() disabledSelected = true;
  @Input() filteredOptions$: Observable<any>;
  @Input() debounceTime = 500
  @Input() isTabKeyboardSeparator = false;
  @Output() changeSearchkey = new EventEmitter<string>();
  @ViewChild('input', { static: false }) input: ElementRef<HTMLInputElement>;
  @ViewChild(MatAutocomplete, { static: true }) matAutocomplete: MatAutocomplete;

  separatorKeysCodes: number[] = [13, 9]
  onTouch: any = () => { };
  onChange: any = () => { };
  form: FormGroup;
  filteredOptions: any;
  disabled = false;
  debounceHelper = new Subject();

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    if (this.options && typeof (this.options[0] === 'object' && this.options[0] !== null)) {
      this.isOptionString = false;
    }
    this.changeInput('');
    this.form = this.fb.group({
      control: [''],
    })
    this.form.valueChanges.subscribe(form => {
      this.onChange(form.control)
    })
    this.debounceHelper.pipe(
      debounceTime(this.debounceTime)
    ).subscribe((res: string) => this.changeSearchkey.emit(res));
  }
  get control() {
    return this.form.get('control');
  }

  add(event: MatChipInputEvent): void {
    // const input = event.input;
    // const value = event.value;
    // console.log('event', event)

    // // Add our fruit
    // if ((value || '').trim()) {
    //   this.languages.setValue([...this.languages.value, value.trim()]);
    // }
    // // Reset the input value
    // if (input) {
    //   input.value = '';
    // }
  }

  remove(chip): void {
    const index = this.control.value.findIndex((ctr) =>
      this.isOptionString ? ctr[this.itemId] === chip[this.itemId] : ctr === chip);
    if (index >= 0) {
      this.changeInput('');
      this.control.value.splice(index, 1);
      this.onChange(this.control.value);
      this.disabled = false;
    }
  }

  changeInput(key: string) {
    this.clientSideFilter ? this.filteredOptions = this.filterOption(key) : this.debounceHelper.next(key);
  }

  filterOption(key: string) {
    return (key === '') ? this.options : this.options.filter(f =>
      this.isOptionString ? f.toLowerCase().includes(key.toLowerCase()) :
        (f[this.displayWith]).toLowerCase().includes(key.toLowerCase()));
  }
  onSelect(event: MatAutocompleteSelectedEvent) {
    const value = event.option.value;
    this.control.setValue([...this.control.value || [], value]);
    this.afterSelect();
  }

  afterSelect() {
    this.input.nativeElement.value = '';
    if (this.control.value.length === this.maxLen) {
      this.disabled = true;
    }
    this.changeInput('');
  }

  disableSelected = (option) => {
    return this.control.value && this.control.value.some(ctr =>
      this.isOptionString ? ctr === option : ctr[this.itemId] === option[this.itemId]);
  }
  chooseFirstOption(keyCode) {
    if (this.matAutocomplete.options.first && (!this.control.value || (this.control.value && !this.control.value.some(ctr =>
      this.isOptionString ? ctr === this.matAutocomplete.options.first.value :
        ctr[this.itemId] === this.matAutocomplete.options.first.value[this.itemId])))) {
      if (keyCode === 'enter') {
        this.matAutocomplete.options.first.select();
      } else if (keyCode === 'tab') {
        this.control.setValue([...this.control.value || [], this.matAutocomplete.options.first.value]);
        this.afterSelect();
      }
    }
  }
  onBlur() {
    this.input.nativeElement.value = '';
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  writeValue(val: string) {
    this.control.setValue(val);
  }

  setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
  }
}
