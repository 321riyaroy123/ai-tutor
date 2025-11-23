# ai/sympy_agent.py
import sympy as sp

def solve_equation(equation_str):
    x = sp.symbols('x')
    expr = sp.sympify(equation_str)
    sol = sp.solve(expr, x)
    return sol
