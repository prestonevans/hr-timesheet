import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Department } from 'src/app/interfaces/department';
import { DepartmentsService } from 'src/app/services/departments.service';
import { AbstractControl, FormControl, ValidatorFn } from '@angular/forms';
import { Employee } from 'src/app/interfaces/employee';

@Component({
  selector: 'app-timesheet',
  templateUrl: './timesheet.component.html',
  styleUrls: ['./timesheet.component.scss']
})
export class TimesheetComponent implements OnInit {
  departments: Department[];
  department: Department;
  employeeNameFC = new FormControl('', this.nameValidator());
  employees: Employee[] = [];
  employeeId = 0;
  weekdays: string[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  constructor(
    private route: ActivatedRoute,
    private departmentsService: DepartmentsService,
  ) { }

  ngOnInit(): void {
    this.departments = this.departmentsService.departments;
    this.department = this.departments.find(department => department.id === this.route.snapshot.params['id']);
}
  addEmployee(): void {
    if (this.employeeNameFC.value) {
      this.employeeId++;
    
      this.employees.push({
        id: this.employeeId.toString(),
        departmentId: this.department?.id,
        name: this.employeeNameFC.value
          .trim()
          .split(/ +/g)
          .map(name => name[0].toUpperCase() + name.slice(1))
          .join(' '),
        payRate: Math.floor(Math.random() * 50) + 50,
        monday: 0,
        tuesday: 0,
        wednesday: 0,
        thursday: 0,
        friday: 0,
        saturday: 0,
        sunday: 0
      });
      this.employeeNameFC.setValue('')
    }
  }

  nameValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      let error = null;
      if (this.employees && this.employees.length) {
        this.employees.forEach(employee => {
          if (employee.name.toLowerCase().replace(/ +/g,' ').trim() === control.value.toLowerCase().replace(/ +/g,' ').trim()) {
            error = {duplicate: true}
          }
        });
      }
      return error
    }
  }

  getTotalHours(employee: Employee):number {
    return this.weekdays.reduce((totalHours,day):number => {
      return totalHours + +employee[day]
    },0)
  }
  deleteEmployee(index:number):void {
    this.employees.splice(index,1)
  }
}
