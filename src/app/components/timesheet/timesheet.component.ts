import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Department } from 'src/app/interfaces/department';
import { DepartmentsService } from 'src/app/services/departments.service';
import { AbstractControl, FormControl, ValidatorFn } from '@angular/forms';
import { Employee } from 'src/app/interfaces/employee';
import { EmployeeService } from 'src/app/services/employee.service';
import { Observable, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-timesheet',
  templateUrl: './timesheet.component.html',
  styleUrls: ['./timesheet.component.scss']
})
export class TimesheetComponent implements OnInit {
  $departments: Observable<Department[]> | undefined;
  department: Department;
  employeeNameFC = new FormControl('', this.nameValidator());
  employees: Employee[] = [];
  employeeId = 0;
  weekdays: string[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  constructor(
    private route: ActivatedRoute,
    private departmentsService: DepartmentsService,
    private employeeService: EmployeeService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.$departments = this.departmentsService.getDepartments();

    this.$departments.pipe(
      switchMap(departments => {
        this.department = departments.find(dept => dept.id === this.route.snapshot.params['id'])
        return this.employeeService.getEmployeeHoursByDepartment(this.department.id);
      }),
      tap(employees => {
        this.employees = employees;
      })
    ).subscribe();
  }
  addEmployee(): void {
    if (this.employeeNameFC.value) {
      this.employeeId++;

      this.employees.push({
        // id: this.employeeId.toString(),
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
          if (employee.name.toLowerCase() === control.value.toLowerCase().replace(/ +/g, ' ').trim()) {
            error = { duplicate: true }
          }
        });
      }
      return error
    }
  }

  getTotalHours(employee: Employee): number {
    return this.weekdays.reduce((totalHours, day): number => {
      return totalHours + +employee[day]
    }, 0)
  }

  deleteEmployee(employee: Employee, index: number): void {
    if (employee.id) {
      this.employeeService.deleteEmployeeHours(employee);
    }

    this.employees.splice(index, 1);
  }

  isEnter(e: KeyboardEvent) {

    //need some help
    // Why do I need to click out of the input to get feed back from validator???

    if (e.code === 'Enter') {
      this.nameValidator()
      if (this.employees.length === 0) {
        this.addEmployee()
        return
      }
      const notDuplicate = this.employees.every(employee => {
        return (employee.name.toLowerCase() !== this.employeeNameFC.value.toLowerCase().replace(/ +/g, ' ').trim())
      });
      if (notDuplicate) {
        this.addEmployee()
      }
    }
  }

  submit(): void {
    this.employees.forEach(employee => {
      if (employee.id) {
        this.employeeService.updateEmployeeHours(employee);
      } else {
        this.employeeService.saveEmployeeHours(employee);
      }
    });
    this.router.navigate(['./departments']);
  }
}
